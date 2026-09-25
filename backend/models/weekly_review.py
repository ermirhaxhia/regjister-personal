from datetime import date, datetime

from pydantic import BaseModel


class WeeklyMetric(BaseModel):
    current: float | None
    previous: float | None


class WeeklySummaryRead(BaseModel):
    week_start: date
    week_end: date
    expenses: WeeklyMetric
    sleep_avg_minutes: WeeklyMetric
    habit_rate_pct: WeeklyMetric
    steps_per_day: WeeklyMetric


class WeeklyReviewUpsert(BaseModel):
    good: str | None = None
    bad: str | None = None
    next: str | None = None


class WeeklyReviewRead(BaseModel):
    week_start: date
    good: str | None = None
    bad: str | None = None
    next: str | None = None
    created_at: datetime
    updated_at: datetime
