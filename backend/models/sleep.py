from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, model_validator


class SleepCreate(BaseModel):
    sleep_start: datetime
    sleep_end: datetime
    night_date: date | None = None
    note: str | None = None

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.sleep_end <= self.sleep_start:
            raise ValueError("sleep_end duhet të jetë pas sleep_start")
        return self


class SleepUpdate(BaseModel):
    sleep_start: datetime | None = None
    sleep_end: datetime | None = None
    night_date: date | None = None
    note: str | None = None


class SleepRead(BaseModel):
    id: str
    sleep_start: datetime
    sleep_end: datetime
    night_date: date
    duration_minutes: Decimal
    note: str | None = None
    created_at: datetime
    updated_at: datetime


class SleepNightPoint(BaseModel):
    night_date: date
    bedtime_hour: float
    waketime_hour: float
    duration_minutes: float
    debt_hours_night: float
    cumulative_debt_hours: float


class SleepInsightsRead(BaseModel):
    nights: list[SleepNightPoint]
    bedtime_mean: float | None
    bedtime_std: float | None
