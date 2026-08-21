import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    company_name: str | None
    timezone: str
    notification_emails: list[str]
    synthesis_tone: str
    plan: str
    created_at: datetime


class UpdateUserRequest(BaseModel):
    company_name: str | None = None
    timezone: str | None = None
    notification_emails: list[str] | None = None
    synthesis_tone: str | None = None
