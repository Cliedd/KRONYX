import uuid
from datetime import datetime
from pydantic import BaseModel


class ChangeResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    page_id: uuid.UUID
    diff_text: str | None
    category: str | None
    impact_level: str
    summary: str | None
    key_changes: str | None
    strategic_recommendation: str | None
    analyzed_at: datetime
    competitor_name: str | None = None
    page_url: str | None = None
    page_type: str | None = None


class ChangeListResponse(BaseModel):
    items: list[ChangeResponse]
    total: int
    page: int
    size: int
