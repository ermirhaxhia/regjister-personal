from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.hr import (
    ContactCreate,
    ContactRead,
    ContactUpdate,
    NoteCreate,
    NoteRead,
    NoteUpdate,
)

router = APIRouter(
    prefix="/contacts",
    tags=["hr"],
    dependencies=[Depends(require_auth)],
)

TABLE_CONTACTS = "colleagues"
TABLE_NOTES = "contact_log"

CONTACT_FIELDS = (
    "id,name,last_name,phone,email,role,description,"
    "sector_id,created_at,updated_at"
)
NOTE_FIELDS = "id,contact_date,note,created_at,updated_at"

_CONTACT_NOT_FOUND = "Kontakti nuk u gjet"
_NOTE_NOT_FOUND = "Shenimi nuk u gjet"
_BAD_SECTOR = "sector_id nuk i perket nje vendi pune ekzistues"


def _contact_or_404(client, contact_id: str) -> dict:
    res = (
        client.table(TABLE_CONTACTS)
        .select(CONTACT_FIELDS)
        .eq("id", contact_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _CONTACT_NOT_FOUND)
    return res.data[0]


def _ensure_contact(client, contact_id: str) -> None:
    res = (
        client.table(TABLE_CONTACTS)
        .select("id")
        .eq("id", contact_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _CONTACT_NOT_FOUND)


def _last_note_map(client, contact_ids: list[str]) -> dict[str, str]:
    if not contact_ids:
        return {}
    rows = (
        client.table(TABLE_NOTES)
        .select("colleague_id,contact_date")
        .in_("colleague_id", contact_ids)
        .execute()
        .data
    )
    out: dict[str, str] = {}
    for r in rows:
        cid, d = r["colleague_id"], r["contact_date"]
        if cid not in out or d > out[cid]:
            out[cid] = d
    return out


@router.get("", response_model=list[ContactRead])
def list_contacts(workplace_id: str | None = Query(default=None)):
    client = get_client()
    q = client.table(TABLE_CONTACTS).select(CONTACT_FIELDS)
    if workplace_id:
        q = q.eq("sector_id", workplace_id)
    rows = q.order("name").order("last_name").execute().data
    last = _last_note_map(client, [r["id"] for r in rows])
    return [{**r, "last_note_date": last.get(r["id"])} for r in rows]


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(body: ContactCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        row = get_client().table(TABLE_CONTACTS).insert(payload).execute().data[0]
    except APIError as exc:
        if exc.code == "23503":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, _BAD_SECTOR)
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kerkese e pavlefshme"
        )
    return {**row, "last_note_date": None}


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: str):
    client = get_client()
    row = _contact_or_404(client, contact_id)
    last = _last_note_map(client, [contact_id])
    return {**row, "last_note_date": last.get(contact_id)}


@router.patch("/{contact_id}", response_model=ContactRead)
def update_contact(contact_id: str, body: ContactUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgje per te perditesuar")
    client = get_client()
    try:
        res = (
            client.table(TABLE_CONTACTS)
            .update(payload)
            .eq("id", contact_id)
            .execute()
        )
    except APIError as exc:
        if exc.code == "23503":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, _BAD_SECTOR)
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kerkese e pavlefshme"
        )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _CONTACT_NOT_FOUND)
    last = _last_note_map(client, [contact_id])
    return {**res.data[0], "last_note_date": last.get(contact_id)}


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: str):
    res = get_client().table(TABLE_CONTACTS).delete().eq("id", contact_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _CONTACT_NOT_FOUND)


@router.get("/{contact_id}/notes", response_model=list[NoteRead])
def list_notes(contact_id: str):
    client = get_client()
    _ensure_contact(client, contact_id)
    return (
        client.table(TABLE_NOTES)
        .select(NOTE_FIELDS)
        .eq("colleague_id", contact_id)
        .order("contact_date", desc=True)
        .order("created_at", desc=True)
        .execute()
        .data
    )


@router.post(
    "/{contact_id}/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
)
def create_note(contact_id: str, body: NoteCreate):
    client = get_client()
    _ensure_contact(client, contact_id)
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["colleague_id"] = contact_id
    payload.setdefault("contact_date", date.today().isoformat())
    return client.table(TABLE_NOTES).insert(payload).execute().data[0]


@router.patch("/{contact_id}/notes/{note_id}", response_model=NoteRead)
def update_note(contact_id: str, note_id: str, body: NoteUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgje per te perditesuar")
    try:
        res = (
            get_client()
            .table(TABLE_NOTES)
            .update(payload)
            .eq("id", note_id)
            .eq("colleague_id", contact_id)
            .execute()
        )
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kerkese e pavlefshme"
        )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOTE_NOT_FOUND)
    return res.data[0]


@router.delete(
    "/{contact_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_note(contact_id: str, note_id: str):
    res = (
        get_client()
        .table(TABLE_NOTES)
        .delete()
        .eq("id", note_id)
        .eq("colleague_id", contact_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOTE_NOT_FOUND)
