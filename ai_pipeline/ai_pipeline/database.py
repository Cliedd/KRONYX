from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from ai_pipeline.config import settings

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=3)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
