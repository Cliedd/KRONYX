import uuid
from datetime import datetime, date
from pydantic import BaseModel


class ReportResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    report_date: date
    content: dict
    sent_at: datetime | None
