import uuid
from datetime import datetime
from pydantic import BaseModel


class PageCreate(BaseModel):
    url: str
    type: str = "custom"


class PageUpdate(BaseModel):
    is_active: bool | None = None
    url: str | None = None


class PageResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    competitor_id: uuid.UUID
    url: str
    type: str
    is_active: bool
    last_scraped_at: datetime | None
