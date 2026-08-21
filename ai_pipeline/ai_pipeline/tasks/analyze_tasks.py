import asyncio
import json

from ai_pipeline.celery_app import celery_app
from ai_pipeline.database import AsyncSessionLocal
from ai_pipeline.workflows.analysis_workflow import analyze_change


# ---------------------------------------------------------------------------
# Celery task
# ---------------------------------------------------------------------------

@celery_app.task(name="kronyx.analyze_change", bind=True, max_retries=2)
def analyze_change_task(
    self,
    change_id: str,
    competitor_name: str,
    page_type: str,
    page_url: str,
    old_content: str,
    new_content: str,
    diff_text: str,
):
    """
    Analyse un changement avec LangGraph + DeepSeek.

    Met à jour la table `changes` avec:
      category, impact_level, summary, key_changes,
      strategic_recommendation, analyzed_at
    """
    try:
        asyncio.run(
            _analyze_change_async(
                change_id=change_id,
                competitor_name=competitor_name,
                page_type=page_type,
                page_url=page_url,
                old_content=old_content,
                new_content=new_content,
                diff_text=diff_text,
            )
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


# ---------------------------------------------------------------------------
# Async implementation
# ---------------------------------------------------------------------------

async def _analyze_change_async(
    change_id: str,
    competitor_name: str,
    page_type: str,
    page_url: str,
    old_content: str,
    new_content: str,
    diff_text: str,
) -> None:
    from sqlalchemy import text

    print(f"[AI] Analyse en cours — change_id={change_id}  concurrent={competitor_name}  page={page_type}")

    # --- LangGraph workflow ---
    result = await analyze_change(
        competitor_name=competitor_name,
        page_type=page_type,
        page_url=page_url,
        old_content=old_content,
        new_content=new_content,
        diff_text=diff_text,
    )

    # Sérialiser key_changes en JSON string pour le stockage
    key_changes = result.get("key_changes", [])
    key_changes_json = (
        json.dumps(key_changes, ensure_ascii=False)
        if isinstance(key_changes, list)
        else str(key_changes)
    )

    # --- Persistance en base ---
    async with AsyncSessionLocal() as db:
        await db.execute(
            text(
                """
                UPDATE changes SET
                    category                 = :category,
                    impact_level             = :impact_level,
                    summary                  = :summary,
                    key_changes              = :key_changes,
                    strategic_recommendation = :strategic_recommendation,
                    analyzed_at              = NOW()
                WHERE id = :change_id
                """
            ),
            {
                "change_id": change_id,
                "category": result.get("category", "Autre"),
                "impact_level": result.get("impact_level", "medium"),
                "summary": result.get("summary", ""),
                "key_changes": key_changes_json,
                "strategic_recommendation": result.get("strategic_recommendation", ""),
            },
        )
        await db.commit()

    print(
        f"[AI] Termine — change_id={change_id}  "
        f"categorie={result.get('category')}  impact={result.get('impact_level')}"
    )
