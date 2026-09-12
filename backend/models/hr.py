import re
from datetime import date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _clean_email(v: str | None) -> str | None:
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None
    if not _EMAIL_RE.match(v):
        raise ValueError("Email i pavlefshem")
    return v


def _clean_required_text(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("Fusha nuk mund te jete bosh")
    return v


def _clean_optional_text(v: str | None) -> str | None:
    if v is None:
        return None
    v = v.strip()
    if not v:
        raise ValueError("Fusha nuk mund te jete bosh")
    return v


Email = Annotated[str | None, AfterValidator(_clean_email)]
RequiredText = Annotated[str, Field(min_length=1), AfterValidator(_clean_required_text)]
OptionalText = Annotated[str | None, AfterValidator(_clean_optional_text)]


class WorkplaceCreate(BaseModel):
    name: RequiredText


class WorkplaceUpdate(BaseModel):
    name: OptionalText = None


class WorkplaceRead(BaseModel):
    id: str
    name: str
    created_at: datetime
    contact_count: int = 0


class ContactCreate(BaseModel):
    name: RequiredText
    sector_id: str
    last_name: str | None = None
    phone: str | None = None
    email: Email = None
    role: str | None = None
    description: str | None = None


class ContactUpdate(BaseModel):
    name: OptionalText = None
    sector_id: str | None = None
    last_name: str | None = None
    phone: str | None = None
    email: Email = None
    role: str | None = None
    description: str | None = None


class ContactRead(BaseModel):
    id: str
    name: str
    last_name: str | None = None
    phone: str | None = None
    email: str | None = None
    role: str | None = None
    description: str | None = None
    sector_id: str
    created_at: datetime
    updated_at: datetime
    last_note_date: date | None = None


class NoteCreate(BaseModel):
    note: RequiredText
    contact_date: date | None = None


class NoteUpdate(BaseModel):
    note: OptionalText = None
    contact_date: date | None = None


class NoteRead(BaseModel):
    id: str
    contact_date: date
    note: str
    created_at: datetime
    updated_at: datetime
