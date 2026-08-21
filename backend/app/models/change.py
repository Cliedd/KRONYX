import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Change(Base):
    __tablename__ = "changes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pages.id", ondelete="CASCADE"), nullable=False
    )
    snapshot_id_old: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("snapshots.id"), nullable=True
    )
    snapshot_id_new: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("snapshots.id"), nullable=False
    )
    diff_text: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    impact_level: Mapped[str] = mapped_column(String(20), default="medium")
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    key_changes: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array as text
    strategic_recommendation: Mapped[str] = mapped_column(Text, nullable=True)
    analyzed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    page = relationship("Page", back_populates="changes")
    snapshot_old = relationship("Snapshot", foreign_keys=[snapshot_id_old])
    snapshot_new = relationship("Snapshot", foreign_keys=[snapshot_id_new])
