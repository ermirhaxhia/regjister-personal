from datetime import date, datetime

from pydantic import BaseModel, Field


class MoodUpsert(BaseModel):
    mood: int = Field(ge=1, le=5)
    energy: int = Field(ge=1, le=5)
    note: str | None = None


class MoodRead(BaseModel):
    log_date: date
    mood: int
    energy: int
    note: str | None = None
    created_at: datetime
    updated_at: datetime
