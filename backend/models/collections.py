from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    title: str = Field(min_length=1)
    author: str | None = None
    total_amount: int | None = Field(default=None, gt=0)


class CollectionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    author: str | None = None
    total_amount: int | None = Field(default=None, gt=0)
    status: Literal["active", "paused", "finished"] | None = None


class CollectionRead(BaseModel):
    id: str
    habit_id: str
    title: str
    author: str | None
    total_amount: int | None
    status: Literal["active", "paused", "finished"]
    amount_total: int
    pct_complete: int | None
    entries_count: int
    amount_per_day: float | None
    estimated_finish: date | None
    created_at: datetime
    updated_at: datetime


class CollectionEntryCreate(BaseModel):
    entry_date: date | None = None
    amount: int = Field(gt=0)
    minutes: int | None = Field(default=None, ge=0)
    note: str | None = None


class CollectionEntryUpdate(BaseModel):
    entry_date: date | None = None
    amount: int | None = Field(default=None, gt=0)
    minutes: int | None = Field(default=None, ge=0)
    note: str | None = None


class CollectionEntryRead(BaseModel):
    id: str
    collection_id: str
    entry_date: date
    amount: int
    minutes: int | None
    note: str | None
    created_at: datetime
    updated_at: datetime
