import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.user import User
from app.models.competitor import Competitor
from app.models.page import Page
from app.schemas.competitor import CompetitorCreate, CompetitorUpdate, CompetitorResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=list[CompetitorResponse])
async def list_competitors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(Competitor.user_id == current_user.id).order_by(Competitor.created_at.desc())
    )
    competitors = result.scalars().all()

    # Count pages per competitor
    pages_count_result = await db.execute(
        select(Page.competitor_id, func.count(Page.id).label("cnt"))
        .where(Page.competitor_id.in_([c.id for c in competitors]))
        .group_by(Page.competitor_id)
    )
    pages_count_map = {row.competitor_id: row.cnt for row in pages_count_result}

    responses = []
    for competitor in competitors:
        data = CompetitorResponse.model_validate(competitor)
        data.pages_count = pages_count_map.get(competitor.id, 0)
        responses.append(data)

    return responses


@router.post("", response_model=CompetitorResponse, status_code=201)
async def create_competitor(
    data: CompetitorCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    competitor = Competitor(
        user_id=current_user.id,
        name=data.name,
        website=data.website,
    )
    db.add(competitor)
    await db.flush()
    response = CompetitorResponse.model_validate(competitor)
    response.pages_count = 0
    return response


@router.get("/{competitor_id}", response_model=CompetitorResponse)
async def get_competitor(
    competitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(
            Competitor.id == competitor_id,
            Competitor.user_id == current_user.id,
        )
    )
    competitor = result.scalar_one_or_none()
    if not competitor:
        raise HTTPException(status_code=404, detail="Concurrent introuvable")

    pages_count_result = await db.execute(
        select(func.count(Page.id)).where(Page.competitor_id == competitor_id)
    )
    pages_count = pages_count_result.scalar() or 0

    response = CompetitorResponse.model_validate(competitor)
    response.pages_count = pages_count
    return response


@router.put("/{competitor_id}", response_model=CompetitorResponse)
async def update_competitor(
    competitor_id: uuid.UUID,
    data: CompetitorUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(
            Competitor.id == competitor_id,
            Competitor.user_id == current_user.id,
        )
    )
    competitor = result.scalar_one_or_none()
    if not competitor:
        raise HTTPException(status_code=404, detail="Concurrent introuvable")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(competitor, field, value)
    await db.flush()

    pages_count_result = await db.execute(
        select(func.count(Page.id)).where(Page.competitor_id == competitor_id)
    )
    pages_count = pages_count_result.scalar() or 0

    response = CompetitorResponse.model_validate(competitor)
    response.pages_count = pages_count
    return response


@router.delete("/{competitor_id}", status_code=204)
async def delete_competitor(
    competitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(
            Competitor.id == competitor_id,
            Competitor.user_id == current_user.id,
        )
    )
    competitor = result.scalar_one_or_none()
    if not competitor:
        raise HTTPException(status_code=404, detail="Concurrent introuvable")

    await db.delete(competitor)
    await db.flush()
