import asyncio
import json
import os
import uuid as uuid_module
from datetime import datetime, date, timedelta

from jinja2 import Environment, FileSystemLoader, select_autoescape

from notifications.celery_app import celery_app
from notifications.config import settings
from notifications.database import AsyncSessionLocal
from notifications.email.resend_client import email_client

# ---------------------------------------------------------------------------
# Jinja2 setup
# ---------------------------------------------------------------------------
_TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "../email/templates")
jinja_env = Environment(
    loader=FileSystemLoader(_TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
)


# ---------------------------------------------------------------------------
# Celery task entry-point
# ---------------------------------------------------------------------------

@celery_app.task(name="kronyx.send_daily_reports", bind=True, max_retries=3)
def send_daily_reports(self):
    """Compile et envoie les rapports quotidiens à tous les utilisateurs actifs.

    Cette tâche est planifiée via Celery Beat à 7h00 UTC chaque jour.
    Elle itère sur tous les utilisateurs actifs et envoie un rapport même
    s'il n'y a aucun changement détecté.
    """
    try:
        asyncio.run(_send_all_reports_async())
    except Exception as exc:
        print(f"[send_daily_reports] Erreur fatale, retry #{self.request.retries}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


# ---------------------------------------------------------------------------
# Async orchestrator
# ---------------------------------------------------------------------------

async def _send_all_reports_async() -> None:
    from sqlalchemy import text

    today = date.today()

    async with AsyncSessionLocal() as db:
        users_result = await db.execute(
            text(
                """
                SELECT id, email, notification_emails, synthesis_tone, timezone
                FROM users
                WHERE is_active = true
                """
            )
        )
        users = users_result.fetchall()

    print(f"[send_daily_reports] {len(users)} utilisateur(s) actif(s) — rapport du {today}")

    for user in users:
        try:
            await _send_user_report(
                user_id=str(user.id),
                primary_email=user.email,
                notification_emails=user.notification_emails,
                today=today,
            )
        except Exception as exc:
            # One failing user must not block the others.
            print(f"[send_daily_reports] Erreur pour user {user.id}: {exc}")


# ---------------------------------------------------------------------------
# Per-user report
# ---------------------------------------------------------------------------

async def _send_user_report(
    user_id: str,
    primary_email: str,
    notification_emails: list[str] | None,
    today: date,
) -> None:
    from sqlalchemy import text

    # Recipients: prefer notification_emails, fall back to primary email
    recipients: list[str] = notification_emails or [primary_email]
    if not recipients:
        print(f"[send_daily_reports] Aucun destinataire pour user {user_id}, ignoré.")
        return

    yesterday = today - timedelta(days=1)
    from_datetime = datetime.combine(yesterday, datetime.min.time())

    # ------------------------------------------------------------------
    # 1. Fetch changes from the last 24 hours
    # ------------------------------------------------------------------
    async with AsyncSessionLocal() as db:
        changes_result = await db.execute(
            text(
                """
                SELECT
                    ch.id,
                    ch.summary,
                    ch.category,
                    ch.impact_level,
                    ch.key_changes,
                    ch.strategic_recommendation,
                    ch.analyzed_at,
                    p.url   AS page_url,
                    p.type  AS page_type,
                    c.name  AS competitor_name
                FROM changes ch
                JOIN pages       p ON p.id = ch.page_id
                JOIN competitors c ON c.id = p.competitor_id
                WHERE c.user_id = :user_id
                  AND ch.analyzed_at >= :from_date
                ORDER BY
                    CASE ch.impact_level
                        WHEN 'high'   THEN 1
                        WHEN 'medium' THEN 2
                        ELSE 3
                    END,
                    ch.analyzed_at DESC
                """
            ),
            {"user_id": user_id, "from_date": from_datetime},
        )
        changes = changes_result.fetchall()

    # ------------------------------------------------------------------
    # 2. Aggregate metrics
    # ------------------------------------------------------------------
    changes_by_competitor: dict[str, list[dict]] = {}
    high_impact_count = 0
    competitors_set: set[str] = set()

    for ch in changes:
        comp_name: str = ch.competitor_name

        # Parse key_changes: stored as JSON array or plain string
        key_changes: list[str] = []
        if ch.key_changes:
            try:
                parsed = json.loads(ch.key_changes)
                key_changes = parsed if isinstance(parsed, list) else [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                key_changes = [str(ch.key_changes)]

        changes_by_competitor.setdefault(comp_name, []).append(
            {
                "summary": ch.summary,
                "category": ch.category,
                "impact_level": ch.impact_level or "low",
                "key_changes": key_changes,
                "strategic_recommendation": ch.strategic_recommendation,
                "page_url": ch.page_url,
                "page_type": ch.page_type,
            }
        )

        if ch.impact_level == "high":
            high_impact_count += 1
        competitors_set.add(comp_name)

    total_changes = len(changes)
    competitors_affected = len(competitors_set)

    # ------------------------------------------------------------------
    # 3. Render HTML template
    # ------------------------------------------------------------------
    template = jinja_env.get_template("daily_report.html")
    html = template.render(
        report_date=today.strftime("%d %B %Y"),
        total_changes=total_changes,
        high_impact_count=high_impact_count,
        competitors_affected=competitors_affected,
        changes_by_competitor=changes_by_competitor,
        frontend_url=settings.FRONTEND_URL,
        year=today.year,
    )

    # ------------------------------------------------------------------
    # 4. Persist the report in DB (before sending — idempotent insert)
    # ------------------------------------------------------------------
    report_id = str(uuid_module.uuid4())
    report_content = json.dumps(
        {
            "total_changes": total_changes,
            "high_impact_count": high_impact_count,
            "competitors_affected": competitors_affected,
            "changes_by_competitor": changes_by_competitor,
        },
        ensure_ascii=False,
    )

    async with AsyncSessionLocal() as db:
        await db.execute(
            text(
                """
                INSERT INTO daily_reports (id, user_id, report_date, content, sent_at)
                VALUES (:id, :user_id, :date, :content, NULL)
                ON CONFLICT (user_id, report_date) DO NOTHING
                """
            ),
            {
                "id": report_id,
                "user_id": user_id,
                "date": today,
                "content": report_content,
            },
        )
        await db.commit()

    # ------------------------------------------------------------------
    # 5. Send email via Resend
    # ------------------------------------------------------------------
    subject = (
        f"[Kronyx] Veille du {today.strftime('%d/%m/%Y')} — "
        f"{total_changes} changement{'s' if total_changes != 1 else ''}"
    )

    success = email_client.send_email(to=recipients, subject=subject, html=html)

    # ------------------------------------------------------------------
    # 6. Update sent_at timestamp on success
    # ------------------------------------------------------------------
    if success:
        async with AsyncSessionLocal() as db:
            await db.execute(
                text(
                    """
                    UPDATE daily_reports
                    SET sent_at = NOW()
                    WHERE user_id = :user_id
                      AND report_date = :date
                    """
                ),
                {"user_id": user_id, "date": today},
            )
            await db.commit()
        print(
            f"[send_daily_reports] Email envoyé à {recipients} "
            f"(user {user_id}, {total_changes} changement(s))"
        )
    else:
        print(
            f"[send_daily_reports] Echec envoi email pour user {user_id} "
            f"(destinataires: {recipients})"
        )
