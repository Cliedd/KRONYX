from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.competitor import Competitor
from app.models.page import Page
from app.models.change import Change
from app.schemas.change import ChangeResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(tz=timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    # Total competitors
    comp_result = await db.execute(
        select(func.count(Competitor.id)).where(Competitor.user_id == current_user.id)
    )
    total_competitors = comp_result.scalar() or 0

    # Total pages across all competitors
    pages_result = await db.execute(
        select(func.count(Page.id))
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id)
    )
    total_pages = pages_result.scalar() or 0

    # Changes today
    changes_today_result = await db.execute(
        select(func.count(Change.id))
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id, Change.analyzed_at >= today_start)
    )
    changes_today = changes_today_result.scalar() or 0

    # Changes this week
    changes_week_result = await db.execute(
        select(func.count(Change.id))
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id, Change.analyzed_at >= week_start)
    )
    changes_week = changes_week_result.scalar() or 0

    # Changes this month
    changes_month_result = await db.execute(
        select(func.count(Change.id))
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id, Change.analyzed_at >= month_start)
    )
    changes_month = changes_month_result.scalar() or 0

    return {
        "total_competitors": total_competitors,
        "total_pages": total_pages,
        "changes_today": changes_today,
        "changes_week": changes_week,
        "changes_month": changes_month,
    }


@router.get("/recent-changes", response_model=list[ChangeResponse])
async def get_recent_changes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Change,
            Page.url.label("page_url"),
            Page.type.label("page_type"),
            Competitor.name.label("competitor_name"),
        )
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id)
        .order_by(Change.analyzed_at.desc())
        .limit(10)
    )
    rows = result.all()

    items = []
    for row in rows:
        change = row[0]
        response = ChangeResponse.model_validate(change)
        response.page_url = row.page_url
        response.page_type = row.page_type
        response.competitor_name = row.competitor_name
        items.append(response)

    return items
