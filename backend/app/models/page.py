import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class PageType(str, enum.Enum):
    pricing = "pricing"
    blog = "blog"
    changelog = "changelog"
    custom = "custom"


class Page(Base):
    __tablename__ = "pages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competitor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="custom")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_scraped_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    competitor = relationship("Competitor", back_populates="pages")
    snapshots = relationship("Snapshot", back_populates="page", cascade="all, delete-orphan")
    changes = relationship("Change", back_populates="page", cascade="all, delete-orphan")
