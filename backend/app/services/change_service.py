import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.change import Change
from app.models.page import Page
from app.models.competitor import Competitor


async def get_changes(
    db: AsyncSession,
    user_id: uuid.UUID,
    competitor_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    impact_level: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """Return paginated changes with competitor context for a user."""
    base_query = (
        select(
            Change,
            Page.url.label("page_url"),
            Page.type.label("page_type"),
            Competitor.name.label("competitor_name"),
        )
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == user_id)
    )

    if competitor_id:
        base_query = base_query.where(Competitor.id == competitor_id)
    if category:
        base_query = base_query.where(Change.category == category)
    if impact_level:
        base_query = base_query.where(Change.impact_level == impact_level)
    if from_date:
        base_query = base_query.where(Change.analyzed_at >= from_date)
    if to_date:
        base_query = base_query.where(Change.analyzed_at <= to_date)

    total_result = await db.execute(select(func.count()).select_from(base_query.subquery()))
    total = total_result.scalar() or 0

    result = await db.execute(
        base_query.order_by(Change.analyzed_at.desc()).limit(limit).offset(offset)
    )
    rows = result.all()

    items = [
        {
            "change": row[0],
            "page_url": row.page_url,
            "page_type": row.page_type,
            "competitor_name": row.competitor_name,
        }
        for row in rows
    ]

    return items, total
