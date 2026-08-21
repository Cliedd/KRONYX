import uuid
from datetime import datetime
from pydantic import BaseModel


class CompetitorCreate(BaseModel):
    name: str
    website: str


class CompetitorUpdate(BaseModel):
    name: str | None = None
    website: str | None = None
    is_active: bool | None = None


class CompetitorResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    website: str
    is_active: bool
    created_at: datetime
    pages_count: int = 0
