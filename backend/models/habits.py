from datetime import date, datetime

from pydantic import BaseModel, Field


class HabitCreate(BaseModel):
    name: str = Field(min_length=1)
    tracking_type: str = Field(pattern="^(binary|duration|koleksion|numer)$")
    # unit_label ka kuptim per 'koleksion' (p.sh. libra) dhe 'numer' (p.sh. kafe, gota uje)
    unit_label: str | None = Field(default=None, min_length=1)
    is_active: bool = True


class HabitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    tracking_type: str | None = Field(default=None, pattern="^(binary|duration|koleksion|numer)$")
    unit_label: str | None = Field(default=None, min_length=1)
    is_active: bool | None = None


class HabitRead(BaseModel):
    id: str
    name: str
    tracking_type: str
    unit_label: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class HabitLogUpsert(BaseModel):
    done: bool | None = None
    duration_minutes: int | None = Field(default=None, ge=0)
    count: int | None = Field(default=None, ge=0)
    note: str | None = None


class HabitLogRead(BaseModel):
    id: str
    habit_id: str
    entry_date: date
    done: bool | None = None
    duration_minutes: int | None = None
    count: int | None = None
    note: str | None = None
    created_at: datetime
    updated_at: datetime


class HabitGridCell(BaseModel):
    date: date
    done: bool | None = None
    duration_minutes: int | None = None
    count: int | None = None
    met: bool


class HabitGridRow(BaseModel):
    id: str
    name: str
    tracking_type: str
    unit_label: str | None = None
    cells: list[HabitGridCell]
    streak_current: int
    rate_pct: int


class HabitGridRead(BaseModel):
    days: list[date]
    habits: list[HabitGridRow]
