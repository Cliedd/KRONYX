import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.competitor import Competitor
from app.models.page import Page
from app.models.change import Change
from app.schemas.change import ChangeResponse, ChangeListResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=ChangeListResponse)
async def list_changes(
    competitor_id: Optional[uuid.UUID] = Query(None),
    category: Optional[str] = Query(None),
    impact_level: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Base query joining changes -> pages -> competitors, filtering by user
    base_query = (
        select(Change, Page.url.label("page_url"), Page.type.label("page_type"), Competitor.name.label("competitor_name"))
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Competitor.user_id == current_user.id)
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

    # Count total
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginated results
    result = await db.execute(
        base_query.order_by(Change.analyzed_at.desc()).limit(limit).offset(offset)
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

    return ChangeListResponse(
        items=items,
        total=total,
        page=(offset // limit) + 1,
        size=limit,
    )


@router.get("/{change_id}", response_model=ChangeResponse)
async def get_change(
    change_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Change, Page.url.label("page_url"), Page.type.label("page_type"), Competitor.name.label("competitor_name"))
        .join(Page, Change.page_id == Page.id)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Change.id == change_id, Competitor.user_id == current_user.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Changement introuvable")

    change = row[0]
    response = ChangeResponse.model_validate(change)
    response.page_url = row.page_url
    response.page_type = row.page_type
    response.competitor_name = row.competitor_name
    return response
