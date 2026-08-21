import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.page import Page
from app.models.competitor import Competitor


async def get_pages_for_competitor(
    db: AsyncSession, competitor_id: uuid.UUID, user_id: uuid.UUID
) -> list[Page]:
    """Return all pages belonging to a competitor owned by the given user."""
    # Verify ownership first
    comp_result = await db.execute(
        select(Competitor).where(Competitor.id == competitor_id, Competitor.user_id == user_id)
    )
    competitor = comp_result.scalar_one_or_none()
    if not competitor:
        return []

    result = await db.execute(
        select(Page).where(Page.competitor_id == competitor_id).order_by(Page.url)
    )
    return result.scalars().all()
