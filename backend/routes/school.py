from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.school import (
    AttendanceRead,
    AttendanceUpsert,
    ClassSessionCreate,
    ClassSessionRead,
    ClassSessionUpdate,
    DaySchedule,
)

router = APIRouter(
    prefix="/school",
    tags=["school"],
    dependencies=[Depends(require_auth)],
)

SESSIONS_TABLE = "class_sessions"
ATTENDANCE_TABLE = "class_attendance"


def _session_or_404(client, session_id: str) -> dict:
    res = client.table(SESSIONS_TABLE).select("*").eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Seanca nuk u gjet")
    return res.data[0]


def _raise_db_error(exc: APIError):
    if exc.code == "23514":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Ora e mbarimit duhet të jetë pas orës së fillimit",
        )
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme")


def _validate_times(start_time, end_time):
    if start_time is not None and end_time is not None and end_time <= start_time:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Ora e mbarimit duhet të jetë pas orës së fillimit",
        )


@router.get("/sessions", response_model=list[ClassSessionRead])
def list_sessions(active: bool | None = Query(default=None)):
    q = get_client().table(SESSIONS_TABLE).select("*").order("weekday").order("start_time")
    if active is not None:
        q = q.eq("is_active", active)
    return q.execute().data


@router.post("/sessions", response_model=ClassSessionRead, status_code=status.HTTP_201_CREATED)
def create_session(body: ClassSessionCreate):
    _validate_times(body.start_time, body.end_time)
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        return get_client().table(SESSIONS_TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)


@router.get("/sessions/{session_id}", response_model=ClassSessionRead)
def get_session(session_id: str):
    return _session_or_404(get_client(), session_id)


@router.patch("/sessions/{session_id}", response_model=ClassSessionRead)
def update_session(session_id: str, body: ClassSessionUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    client = get_client()
    existing = _session_or_404(client, session_id)
    start_time = payload.get("start_time", existing["start_time"])
    end_time = payload.get("end_time", existing["end_time"])
    _validate_times(start_time, end_time)
    try:
        res = client.table(SESSIONS_TABLE).update(payload).eq("id", session_id).execute()
    except APIError as exc:
        _raise_db_error(exc)
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Seanca nuk u gjet")
    return res.data[0]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str):
    res = get_client().table(SESSIONS_TABLE).delete().eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Seanca nuk u gjet")


@router.get("/day/{d}", response_model=list[DaySchedule])
def get_day_schedule(d: date):
    client = get_client()
    weekday = d.weekday()
    sessions = (
        client.table(SESSIONS_TABLE)
        .select("*")
        .eq("is_active", True)
        .eq("weekday", weekday)
        .order("start_time")
        .execute()
        .data
    )
    attendance_rows = (
        client.table(ATTENDANCE_TABLE)
        .select("*")
        .eq("class_date", d.isoformat())
        .execute()
        .data
    )
    attendance_by_session = {row["session_id"]: row for row in attendance_rows}

    result: list[DaySchedule] = []
    for s in sessions:
        att = attendance_by_session.get(s["id"])
        result.append(
            DaySchedule(
                session_id=s["id"],
                subject_name=s["subject_name"],
                session_type=s.get("session_type"),
                professor=s.get("professor"),
                room=s.get("room"),
                start_time=s["start_time"],
                end_time=s["end_time"],
                attendance_id=att["id"] if att else None,
                attended=att["attended"] if att else None,
                note=att["note"] if att else None,
            )
        )
    return result


@router.put("/attendance/{session_id}/{class_date}", response_model=AttendanceRead)
def upsert_attendance(session_id: str, class_date: date, body: AttendanceUpsert):
    client = get_client()
    _session_or_404(client, session_id)
    payload = {
        **body.model_dump(mode="json", exclude_none=True),
        "session_id": session_id,
        "class_date": class_date.isoformat(),
    }
    try:
        res = (
            client.table(ATTENDANCE_TABLE)
            .upsert(payload, on_conflict="session_id,class_date")
            .execute()
        )
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    return res.data[0]


@router.delete(
    "/attendance/{session_id}/{class_date}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_attendance(session_id: str, class_date: date):
    res = (
        get_client()
        .table(ATTENDANCE_TABLE)
        .delete()
        .eq("session_id", session_id)
        .eq("class_date", class_date.isoformat())
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Regjistrimi i prezencës nuk u gjet")


@router.get("/attendance/summary")
def attendance_summary(
    session_id: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
):
    """Nëse jepet session_id, kthen {total, attended, rate_pct} për atë seancë.
    Përndryshe kthen listë me përmbledhje për çdo seancë (grupuar sipas lëndës)."""
    client = get_client()
    q = client.table(ATTENDANCE_TABLE).select("*")
    if session_id:
        q = q.eq("session_id", session_id)
    if date_from:
        q = q.gte("class_date", date_from.isoformat())
    if date_to:
        q = q.lte("class_date", date_to.isoformat())
    rows = q.execute().data

    if session_id:
        total = len(rows)
        attended = sum(1 for r in rows if r["attended"])
        rate = round(attended / total * 100, 1) if total else 0.0
        return {"total": total, "attended": attended, "rate_pct": rate}

    sessions = client.table(SESSIONS_TABLE).select("id,subject_name").execute().data
    names_by_id = {s["id"]: s["subject_name"] for s in sessions}

    by_session: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_session[r["session_id"]].append(r)

    summary = []
    for sid, session_rows in by_session.items():
        total = len(session_rows)
        attended = sum(1 for r in session_rows if r["attended"])
        rate = round(attended / total * 100, 1) if total else 0.0
        summary.append(
            {
                "session_id": sid,
                "subject_name": names_by_id.get(sid, "?"),
                "total": total,
                "attended": attended,
                "rate_pct": rate,
            }
        )
    return summary
