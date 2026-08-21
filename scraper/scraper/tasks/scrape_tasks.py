"""
Celery tasks de scraping pour Kronyx.

- scrape_page      : scrape une page individuelle, detecte les changements,
                     sauvegarde snapshot + change record, declenche l'analyse IA.
- scrape_all_pages : lance un scrape_page pour chaque page active (Celery Beat).
"""

import asyncio
import uuid as uuid_module
from sqlalchemy import text

from scraper.celery_app import celery_app
from scraper.database import AsyncSessionLocal
from scraper.crawlers.playwright_crawler import PlaywrightCrawler
from scraper.crawlers.robots_checker import robots_checker
from scraper.detectors.hash_detector import HashDetector
from scraper.detectors.change_analyzer import ChangeAnalyzer


# ---------------------------------------------------------------------------
# Task 1 : scrape_page
# ---------------------------------------------------------------------------

@celery_app.task(name="kronyx.scrape_page", bind=True, max_retries=3)
def scrape_page(self, page_id: str):
    """
    Scrape une page, detecte les changements, declenche l'analyse IA si necessaire.

    Flow:
    1. Charge la page depuis DB (avec competitor info + dernier snapshot)
    2. Verifie robots.txt
    3. Scrape avec Playwright
    4. Compare hash avec dernier snapshot
    5. Si changement:
       a. Sauvegarde nouveau snapshot en DB
       b. Cree un enregistrement changes en DB avec diff_text
       c. Declenche la task `kronyx.analyze_change` avec le change_id
    6. Update page.last_scraped_at (toujours, meme sans changement)
    """
    try:
        asyncio.run(_scrape_page_async(page_id))
    except Exception as exc:
        print(f"[scrape_page] Erreur pour page {page_id}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


async def _scrape_page_async(page_id: str) -> None:
    async with AsyncSessionLocal() as db:
        # ------------------------------------------------------------------
        # 1. Charger la page + competitor + dernier snapshot (LATERAL join)
        # ------------------------------------------------------------------
        result = await db.execute(
            text("""
                SELECT
                    p.id,
                    p.url,
                    p.type,
                    p.competitor_id,
                    c.name  AS competitor_name,
                    c.user_id,
                    s.content_hash  AS last_hash,
                    s.content_text  AS last_text,
                    s.id            AS last_snapshot_id
                FROM pages p
                JOIN competitors c ON c.id = p.competitor_id
                LEFT JOIN LATERAL (
                    SELECT id, content_hash, content_text
                    FROM snapshots
                    WHERE page_id = p.id
                    ORDER BY scraped_at DESC
                    LIMIT 1
                ) s ON true
                WHERE p.id = :page_id
                  AND p.is_active = true
            """),
            {"page_id": page_id},
        )
        row = result.fetchone()
        if not row:
            print(f"[scrape_page] Page {page_id} introuvable ou inactive — abandon.")
            return

        # ------------------------------------------------------------------
        # 2. Verifier robots.txt
        # ------------------------------------------------------------------
        allowed = await robots_checker.is_allowed(row.url)
        if not allowed:
            print(f"[scrape_page] robots.txt interdit pour {row.url} — abandon.")
            return

        # ------------------------------------------------------------------
        # 3. Scraper avec Playwright
        # ------------------------------------------------------------------
        print(f"[scrape_page] Scraping de {row.url} ...")
        async with PlaywrightCrawler() as crawler:
            scrape_result = await crawler.scrape(row.url)

        if not scrape_result:
            print(f"[scrape_page] Echec du scraping pour {row.url}.")
            return

        html_content, title = scrape_result
        print(f"[scrape_page] Scraping OK — titre: {title!r}")

        # ------------------------------------------------------------------
        # 4. Detecter changement par hash
        # ------------------------------------------------------------------
        detector = HashDetector()
        changed, new_hash, new_text = detector.has_changed(row.last_hash, html_content)

        # Update last_scraped_at dans tous les cas
        await db.execute(
            text("UPDATE pages SET last_scraped_at = NOW() WHERE id = :id"),
            {"id": page_id},
        )

        if not changed:
            print(f"[scrape_page] Aucun changement detecte pour {row.url}.")
            await db.commit()
            return

        print(f"[scrape_page] Changement detecte pour {row.url} — sauvegarde en cours...")

        # ------------------------------------------------------------------
        # 5a. Nouveau snapshot
        # ------------------------------------------------------------------
        new_snapshot_id = str(uuid_module.uuid4())
        await db.execute(
            text("""
                INSERT INTO snapshots
                    (id, page_id, content_hash, content_text, content_html, scraped_at)
                VALUES
                    (:id, :page_id, :hash, :text, :html, NOW())
            """),
            {
                "id":      new_snapshot_id,
                "page_id": page_id,
                "hash":    new_hash,
                "text":    new_text[:50_000],
                "html":    html_content[:100_000],
            },
        )

        # ------------------------------------------------------------------
        # 5b. Preparer le diff et creer le change record
        # ------------------------------------------------------------------
        analyzer = ChangeAnalyzer()
        change_data = analyzer.prepare_change_data(
            old_text=row.last_text or "",
            new_text=new_text,
            competitor_name=row.competitor_name,
            page_type=row.type,
            page_url=row.url,
        )

        change_id = str(uuid_module.uuid4())
        await db.execute(
            text("""
                INSERT INTO changes
                    (id, page_id, snapshot_id_old, snapshot_id_new, diff_text, impact_level, analyzed_at)
                VALUES
                    (:id, :page_id, :snap_old, :snap_new, :diff, 'medium', NOW())
            """),
            {
                "id":       change_id,
                "page_id":  page_id,
                "snap_old": row.last_snapshot_id,
                "snap_new": new_snapshot_id,
                "diff":     change_data["diff_text"],
            },
        )

        await db.commit()

        # ------------------------------------------------------------------
        # 5c. Declencher l'analyse IA (queue separee)
        # ------------------------------------------------------------------
        from celery import current_app as celery_current_app

        celery_current_app.send_task(
            "kronyx.analyze_change",
            kwargs={
                "change_id":       change_id,
                "competitor_name": row.competitor_name,
                "page_type":       row.type,
                "page_url":        row.url,
                "old_content":     change_data["old_content"],
                "new_content":     change_data["new_content"],
                "diff_text":       change_data["diff_text"],
            },
            queue="ai_analysis",
        )

        print(
            f"[scrape_page] change_id={change_id} sauvegarde. "
            f"Analyse IA declenchee pour {row.url}."
        )


# ---------------------------------------------------------------------------
# Task 2 : scrape_all_pages
# ---------------------------------------------------------------------------

@celery_app.task(name="kronyx.scrape_all_pages")
def scrape_all_pages():
    """
    Scrape toutes les pages actives.
    Lance par Celery Beat quotidiennement (ou selon le planning configure).
    Les pages non encore scrapees (last_scraped_at IS NULL) passent en premier.
    """
    asyncio.run(_scrape_all_pages_async())


async def _scrape_all_pages_async() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("""
                SELECT id
                FROM pages
                WHERE is_active = true
                ORDER BY last_scraped_at ASC NULLS FIRST
            """)
        )
        page_ids = [str(row.id) for row in result.fetchall()]

    total = len(page_ids)
    print(f"[scrape_all_pages] Lancement scraping de {total} pages.")

    for i, page_id in enumerate(page_ids, start=1):
        # countdown=1 s pour etaler les requetes et ne pas saturer Playwright
        scrape_page.apply_async(
            args=[page_id],
            queue="scraping",
            countdown=i,  # 1 s d'ecart entre chaque dispatch
        )

    print(f"[scrape_all_pages] {total} taches scrape_page envoyees dans la queue 'scraping'.")
