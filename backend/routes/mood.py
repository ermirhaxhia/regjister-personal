from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.mood import MoodRead, MoodUpsert

router = APIRouter(
    prefix="/mood",
    tags=["mood"],
    dependencies=[Depends(require_auth)],
)

TABLE = "mood_log"


def _raise_db_error(exc: APIError):
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme")


@router.get("", response_model=list[MoodRead])
def list_mood(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)
    return (
        get_client()
        .table(TABLE)
        .select("*")
        .gte("log_date", date_from.isoformat())
        .lte("log_date", date_to.isoformat())
        .order("log_date", desc=True)
        .execute()
        .data
    )


@router.put("/{d}", response_model=MoodRead)
def upsert_mood(d: date, body: MoodUpsert):
    payload = {
        **body.model_dump(mode="json", exclude_none=True),
        "log_date": d.isoformat(),
    }
    try:
        res = (
            get_client()
            .table(TABLE)
            .upsert(payload, on_conflict="log_date")
            .execute()
        )
    except APIError as exc:
        _raise_db_error(exc)
    return res.data[0]


@router.get("/{d}", response_model=MoodRead)
def get_mood(d: date):
    res = get_client().table(TABLE).select("*").eq("log_date", d.isoformat()).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk ka të dhëna humori për këtë ditë")
    return res.data[0]


@router.delete("/{d}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mood(d: date):
    res = get_client().table(TABLE).delete().eq("log_date", d.isoformat()).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk ka të dhëna humori për këtë ditë")
