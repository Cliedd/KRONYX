import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.competitor import Competitor
from app.models.page import Page
from app.schemas.page import PageCreate, PageUpdate, PageResponse
from app.dependencies import get_current_user

router = APIRouter()


async def _get_competitor_for_user(
    competitor_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> Competitor:
    result = await db.execute(
        select(Competitor).where(
            Competitor.id == competitor_id,
            Competitor.user_id == user_id,
        )
    )
    competitor = result.scalar_one_or_none()
    if not competitor:
        raise HTTPException(status_code=404, detail="Concurrent introuvable")
    return competitor


@router.get("/competitors/{competitor_id}/pages", response_model=list[PageResponse])
async def list_pages(
    competitor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_competitor_for_user(competitor_id, current_user.id, db)

    result = await db.execute(
        select(Page)
        .where(Page.competitor_id == competitor_id)
        .order_by(Page.url)
    )
    return result.scalars().all()


@router.post("/competitors/{competitor_id}/pages", response_model=PageResponse, status_code=201)
async def create_page(
    competitor_id: uuid.UUID,
    data: PageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_competitor_for_user(competitor_id, current_user.id, db)

    page = Page(
        competitor_id=competitor_id,
        url=data.url,
        type=data.type,
    )
    db.add(page)
    await db.flush()
    return page


@router.put("/pages/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: uuid.UUID,
    data: PageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Page)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Page.id == page_id, Competitor.user_id == current_user.id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page introuvable")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(page, field, value)
    await db.flush()
    return page


@router.delete("/pages/{page_id}", status_code=204)
async def delete_page(
    page_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Page)
        .join(Competitor, Page.competitor_id == Competitor.id)
        .where(Page.id == page_id, Competitor.user_id == current_user.id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page introuvable")

    await db.delete(page)
    await db.flush()
