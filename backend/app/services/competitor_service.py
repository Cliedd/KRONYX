import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.competitor import Competitor
from app.models.page import Page


async def get_competitors_with_page_count(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    """Return all competitors for a user with their page count."""
    result = await db.execute(
        select(Competitor).where(Competitor.user_id == user_id).order_by(Competitor.created_at.desc())
    )
    competitors = result.scalars().all()

    if not competitors:
        return []

    pages_count_result = await db.execute(
        select(Page.competitor_id, func.count(Page.id).label("cnt"))
        .where(Page.competitor_id.in_([c.id for c in competitors]))
        .group_by(Page.competitor_id)
    )
    pages_count_map = {row.competitor_id: row.cnt for row in pages_count_result}

    return [
        {"competitor": c, "pages_count": pages_count_map.get(c.id, 0)}
        for c in competitors
    ]
