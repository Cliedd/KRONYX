from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token


async def register_user(db: AsyncSession, email: str, password: str, company_name: str | None, timezone: str) -> str:
    """Create a new user and return an access token."""
    user = User(
        email=email,
        password_hash=hash_password(password),
        company_name=company_name,
        timezone=timezone,
        notification_emails=[email],
    )
    db.add(user)
    await db.flush()
    return create_access_token({"sub": str(user.id)})


async def authenticate_user(db: AsyncSession, email: str, password: str) -> str | None:
    """Verify credentials and return an access token, or None if invalid."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return create_access_token({"sub": str(user.id)})
