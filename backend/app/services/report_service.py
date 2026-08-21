import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.daily_report import DailyReport


async def get_reports_for_user(db: AsyncSession, user_id: uuid.UUID, limit: int = 30) -> list[DailyReport]:
    """Return the most recent reports for a user."""
    result = await db.execute(
        select(DailyReport)
        .where(DailyReport.user_id == user_id)
        .order_by(DailyReport.report_date.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def get_report_by_date(db: AsyncSession, user_id: uuid.UUID, report_date: date) -> DailyReport | None:
    """Return a specific report by date for a user."""
    result = await db.execute(
        select(DailyReport).where(
            DailyReport.user_id == user_id,
            DailyReport.report_date == report_date,
        )
    )
    return result.scalar_one_or_none()
