from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.work import (
    WorkSessionCreate,
    WorkSessionRead,
    WorkSessionUpdate,
    WorkSummaryRead,
)

router = APIRouter(
    prefix="/work-sessions",
    tags=["work"],
    dependencies=[Depends(require_auth)],
)

TABLE = "work_sessions"
TABLE_WORKPLACES = "sectors"

_NOT_FOUND_MSG = "Seanca e punës nuk u gjet"
_END_AFTER_START_MSG = "end_ts duhet të jetë pas start_ts"


def _raise_db_error(exc: APIError):
    if exc.code == "23514":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, _END_AFTER_START_MSG)
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme")


def _attach_workplace_names(client, rows: list[dict]) -> list[dict]:
    ids = {r["workplace_id"] for r in rows if r.get("workplace_id")}
    if not ids:
        return [{**r, "workplace_name": None} for r in rows]
    sectors = (
        client.table(TABLE_WORKPLACES)
        .select("id,name")
        .in_("id", list(ids))
        .execute()
        .data
    )
    names = {s["id"]: s["name"] for s in sectors}
    return [{**r, "workplace_name": names.get(r.get("workplace_id"))} for r in rows]


@router.get("", response_model=list[WorkSessionRead])
def list_work_sessions(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)
    client = get_client()
    rows = (
        client.table(TABLE)
        .select("*")
        .gte("work_date", date_from.isoformat())
        .lte("work_date", date_to.isoformat())
        .order("work_date", desc=True)
        .execute()
        .data
    )
    return _attach_workplace_names(client, rows)


@router.post("", response_model=WorkSessionRead, status_code=status.HTTP_201_CREATED)
def create_work_session(body: WorkSessionCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["work_date"] = (body.work_date or body.start_ts.date()).isoformat()
    client = get_client()
    try:
        row = client.table(TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)
    return _attach_workplace_names(client, [row])[0]


@router.get("/summary", response_model=WorkSummaryRead)
def summary_work_sessions(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=6)
    rows = (
        get_client()
        .table(TABLE)
        .select("work_date,duration_minutes")
        .gte("work_date", date_from.isoformat())
        .lte("work_date", date_to.isoformat())
        .execute()
        .data
    )
    total_minutes = sum(float(r["duration_minutes"]) for r in rows)
    total_hours = total_minutes / 60.0
    days_worked = len({r["work_date"] for r in rows})
    avg_hours_per_day = total_hours / days_worked if days_worked else 0.0
    return WorkSummaryRead(
        total_hours=round(total_hours, 2),
        days_worked=days_worked,
        avg_hours_per_day=round(avg_hours_per_day, 2),
    )


@router.get("/{session_id}", response_model=WorkSessionRead)
def get_work_session(session_id: str):
    client = get_client()
    res = client.table(TABLE).select("*").eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    return _attach_workplace_names(client, res.data)[0]


@router.patch("/{session_id}", response_model=WorkSessionRead)
def update_work_session(session_id: str, body: WorkSessionUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    client = get_client()
    try:
        res = client.table(TABLE).update(payload).eq("id", session_id).execute()
    except APIError as exc:
        _raise_db_error(exc)
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    return _attach_workplace_names(client, res.data)[0]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_session(session_id: str):
    res = get_client().table(TABLE).delete().eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
