from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class BookCreate(BaseModel):
    title: str = Field(min_length=1)
    author: str | None = None
    total_pages: int = Field(gt=0)


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    author: str | None = None
    total_pages: int | None = Field(default=None, gt=0)
    status: Literal["reading", "finished"] | None = None


class BookRead(BaseModel):
    id: str
    title: str
    author: str | None
    total_pages: int
    status: Literal["reading", "finished"]
    pages_read: int
    pct_complete: int
    sessions_count: int
    pages_per_day: float | None
    estimated_finish: date | None
    created_at: datetime
    updated_at: datetime


class ReadingSessionCreate(BaseModel):
    session_date: date | None = None
    pages_read: int = Field(gt=0)
    minutes: int | None = Field(default=None, ge=0)
    note: str | None = None


class ReadingSessionUpdate(BaseModel):
    session_date: date | None = None
    pages_read: int | None = Field(default=None, gt=0)
    minutes: int | None = Field(default=None, ge=0)
    note: str | None = None


class ReadingSessionRead(BaseModel):
    id: str
    book_id: str
    session_date: date
    pages_read: int
    minutes: int | None
    note: str | None
    created_at: datetime
    updated_at: datetime
