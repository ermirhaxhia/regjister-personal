from datetime import date, timedelta
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.reading import (
    BookCreate,
    BookRead,
    BookUpdate,
    ReadingSessionCreate,
    ReadingSessionRead,
    ReadingSessionUpdate,
)

router = APIRouter(
    prefix="/books",
    tags=["reading"],
    dependencies=[Depends(require_auth)],
)

TABLE = "books"
SESSIONS_TABLE = "reading_sessions"


def _book_or_404(client, book_id: str) -> dict:
    res = client.table(TABLE).select("*").eq("id", book_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Libri nuk u gjet")
    return res.data[0]


def _enrich(client, book: dict) -> dict:
    sessions = (
        client.table(SESSIONS_TABLE)
        .select("session_date, pages_read")
        .eq("book_id", book["id"])
        .order("session_date")
        .execute()
        .data
    )
    total_pages = book["total_pages"]
    pages_read = sum(s["pages_read"] for s in sessions)
    sessions_count = len(sessions)
    pct_complete = (
        min(100, round(pages_read / total_pages * 100)) if sessions_count else 0
    )

    pages_per_day = None
    estimated_finish = None
    if sessions_count >= 2 and book["status"] == "reading":
        today = date.today()
        first_date = sessions[0]["session_date"]
        if isinstance(first_date, str):
            first_date = date.fromisoformat(first_date)
        days = max((today - first_date).days + 1, 1)
        rate = pages_read / days
        if rate > 0:
            pages_per_day = rate
            pages_left = max(total_pages - pages_read, 0)
            if pages_left > 0:
                estimated_finish = today + timedelta(days=ceil(pages_left / rate))
            else:
                estimated_finish = today

    return {
        **book,
        "pages_read": pages_read,
        "pct_complete": pct_complete,
        "sessions_count": sessions_count,
        "pages_per_day": pages_per_day,
        "estimated_finish": estimated_finish,
    }


def _sync_habit_log(client, d: date) -> None:
    """Sinkronizon kohëzgjatjen totale të leximit të një date me habit_log."""
    lexim_habits = (
        client.table("habits").select("id").eq("tracking_type", "lexim").execute().data
    )
    if not lexim_habits:
        return
    day_str = d.isoformat()
    total_minutes = sum(
        (r.get("minutes") or 0)
        for r in client.table(SESSIONS_TABLE)
        .select("minutes, session_date")
        .eq("session_date", day_str)
        .execute()
        .data
    )
    for h in lexim_habits:
        existing = (
            client.table("habit_log")
            .select("id")
            .eq("habit_id", h["id"])
            .eq("entry_date", day_str)
            .execute()
            .data
        )
        if total_minutes > 0:
            payload = {
                "habit_id": h["id"],
                "entry_date": day_str,
                "duration_minutes": total_minutes,
            }
            if existing:
                client.table("habit_log").update(payload).eq(
                    "id", existing[0]["id"]
                ).execute()
            else:
                client.table("habit_log").insert(payload).execute()
        elif existing:
            client.table("habit_log").delete().eq("id", existing[0]["id"]).execute()


@router.get("", response_model=list[BookRead])
def list_books():
    client = get_client()
    books = client.table(TABLE).select("*").execute().data
    enriched = [_enrich(client, b) for b in books]
    enriched.sort(key=lambda b: b["updated_at"], reverse=True)
    enriched.sort(key=lambda b: b["status"] != "reading")
    return enriched


@router.post("", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(body: BookCreate):
    client = get_client()
    payload = body.model_dump(mode="json", exclude_none=True)
    book = client.table(TABLE).insert(payload).execute().data[0]
    return _enrich(client, book)


@router.get("/{book_id}", response_model=BookRead)
def get_book(book_id: str):
    client = get_client()
    return _enrich(client, _book_or_404(client, book_id))


@router.patch("/{book_id}", response_model=BookRead)
def update_book(book_id: str, body: BookUpdate):
    client = get_client()
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = client.table(TABLE).update(payload).eq("id", book_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Libri nuk u gjet")
    return _enrich(client, res.data[0])


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str):
    res = get_client().table(TABLE).delete().eq("id", book_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Libri nuk u gjet")


@router.get("/{book_id}/sessions", response_model=list[ReadingSessionRead])
def list_sessions(book_id: str):
    client = get_client()
    _book_or_404(client, book_id)
    return (
        client.table(SESSIONS_TABLE)
        .select("*")
        .eq("book_id", book_id)
        .order("session_date", desc=True)
        .execute()
        .data
    )


@router.post(
    "/{book_id}/sessions",
    response_model=ReadingSessionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_session(book_id: str, body: ReadingSessionCreate):
    client = get_client()
    _book_or_404(client, book_id)
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["book_id"] = book_id
    try:
        session = client.table(SESSIONS_TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    session_date = session["session_date"]
    if isinstance(session_date, str):
        session_date = date.fromisoformat(session_date)
    _sync_habit_log(client, session_date)
    return session


@router.patch(
    "/{book_id}/sessions/{session_id}", response_model=ReadingSessionRead
)
def update_session(book_id: str, session_id: str, body: ReadingSessionUpdate):
    client = get_client()
    _book_or_404(client, book_id)
    existing = (
        client.table(SESSIONS_TABLE).select("*").eq("id", session_id).execute().data
    )
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sesioni nuk u gjet")
    old_date = existing[0]["session_date"]
    if isinstance(old_date, str):
        old_date = date.fromisoformat(old_date)

    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = client.table(SESSIONS_TABLE).update(payload).eq("id", session_id).execute()
    session = res.data[0]

    new_date = session["session_date"]
    if isinstance(new_date, str):
        new_date = date.fromisoformat(new_date)

    _sync_habit_log(client, new_date)
    if new_date != old_date:
        _sync_habit_log(client, old_date)
    return session


@router.delete(
    "/{book_id}/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_session(book_id: str, session_id: str):
    client = get_client()
    _book_or_404(client, book_id)
    existing = (
        client.table(SESSIONS_TABLE).select("*").eq("id", session_id).execute().data
    )
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sesioni nuk u gjet")
    session_date = existing[0]["session_date"]
    if isinstance(session_date, str):
        session_date = date.fromisoformat(session_date)
    client.table(SESSIONS_TABLE).delete().eq("id", session_id).execute()
    _sync_habit_log(client, session_date)
