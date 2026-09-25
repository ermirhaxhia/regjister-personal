from datetime import date, datetime

from pydantic import BaseModel, model_validator


class WorkSessionCreate(BaseModel):
    start_ts: datetime
    end_ts: datetime
    work_date: date | None = None
    workplace_id: str | None = None
    note: str | None = None

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.end_ts <= self.start_ts:
            raise ValueError("end_ts duhet të jetë pas start_ts")
        return self


class WorkSessionUpdate(BaseModel):
    start_ts: datetime | None = None
    end_ts: datetime | None = None
    work_date: date | None = None
    workplace_id: str | None = None
    note: str | None = None


class WorkSessionRead(BaseModel):
    id: str
    start_ts: datetime
    end_ts: datetime
    work_date: date
    workplace_id: str | None = None
    workplace_name: str | None = None
    duration_minutes: float
    note: str | None = None
    created_at: datetime
    updated_at: datetime


class WorkSummaryRead(BaseModel):
    total_hours: float
    days_worked: int
    avg_hours_per_day: float
