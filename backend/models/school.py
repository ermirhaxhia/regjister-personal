from datetime import date, datetime, time

from pydantic import BaseModel, Field


class ClassSessionCreate(BaseModel):
    subject_name: str = Field(min_length=1)
    session_type: str | None = None
    professor: str | None = None
    room: str | None = None
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    is_active: bool = True


class ClassSessionUpdate(BaseModel):
    subject_name: str | None = Field(default=None, min_length=1)
    session_type: str | None = None
    professor: str | None = None
    room: str | None = None
    weekday: int | None = Field(default=None, ge=0, le=6)
    start_time: time | None = None
    end_time: time | None = None
    is_active: bool | None = None


class ClassSessionRead(BaseModel):
    id: str
    subject_name: str
    session_type: str | None = None
    professor: str | None = None
    room: str | None = None
    weekday: int
    start_time: time
    end_time: time
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AttendanceUpsert(BaseModel):
    attended: bool
    note: str | None = None


class AttendanceRead(BaseModel):
    id: str
    session_id: str
    class_date: date
    attended: bool
    note: str | None = None
    created_at: datetime
    updated_at: datetime


class DaySchedule(BaseModel):
    """Seancat e planifikuara për një datë specifike, bashkuar me prezencën nëse ekziston."""

    session_id: str
    subject_name: str
    session_type: str | None = None
    professor: str | None = None
    room: str | None = None
    start_time: time
    end_time: time
    attendance_id: str | None = None
    attended: bool | None = None
    note: str | None = None


class AttendanceSummary(BaseModel):
    total: int
    attended: int
    rate_pct: float


class SubjectAttendanceSummary(AttendanceSummary):
    session_id: str
    subject_name: str
