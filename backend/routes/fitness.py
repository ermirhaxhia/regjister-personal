from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.fitness import (
    FitnessEntryCreate,
    FitnessEntryRead,
    FitnessEntryUpdate,
    FitnessGoalBlock,
    FitnessRecentEntry,
    FitnessSeriesPoint,
    FitnessSummary,
)

router = APIRouter(
    prefix="/fitness",
    tags=["fitness"],
    dependencies=[Depends(require_auth)],
)

TABLE = "fitness_entries"
TYPES_TABLE = "activity_types"

_ENTRY_NOT_FOUND = "Hyrja nuk u gjet"
_TYPE_NOT_FOUND = "Lloji i aktivitetit nuk u gjet"


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _types_map(client) -> dict[str, dict]:
    rows = client.table(TYPES_TABLE).select("*").execute().data
    return {r["id"]: r for r in rows}


def _type_or_404(client, type_id: str) -> dict:
    res = client.table(TYPES_TABLE).select("*").eq("id", type_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _TYPE_NOT_FOUND)
    return res.data[0]


def _check_units(values: dict, units: list[str]) -> None:
    bad = [k for k in values if k not in units]
    if bad:
        raise HTTPException(422, f"Njësi jashtë llojit: {', '.join(bad)}")


def _shape(row: dict, types: dict[str, dict]) -> dict:
    name = (types.get(row["activity_type_id"]) or {}).get("name")
    return {**row, "activity_type_name": name}


@router.get("/entries", response_model=list[FitnessEntryRead])
def list_entries(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    activity_type_id: str | None = Query(default=None),
):
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)
    client = get_client()
    q = (
        client.table(TABLE)
        .select("*")
        .gte("entry_date", date_from.isoformat())
        .lte("entry_date", date_to.isoformat())
        .order("entry_date", desc=True)
        .order("created_at", desc=True)
    )
    if activity_type_id:
        q = q.eq("activity_type_id", activity_type_id)
    rows = q.execute().data
    types = _types_map(client)
    return [_shape(r, types) for r in rows]


@router.post(
    "/entries", response_model=FitnessEntryRead, status_code=status.HTTP_201_CREATED
)
def create_entry(body: FitnessEntryCreate):
    client = get_client()
    activity = _type_or_404(client, body.activity_type_id)
    _check_units(body.values, activity["units"])
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        row = client.table(TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    return _shape(row, {activity["id"]: activity})


@router.get("/summary", response_model=FitnessSummary)
def fitness_summary(days: int = Query(default=30, ge=1, le=365)):
    client = get_client()
    today = date.today()
    start = today - timedelta(days=days - 1)
    day_list = [start + timedelta(days=i) for i in range(days)]

    types = (
        client.table(TYPES_TABLE)
        .select("*")
        .order("sort_order")
        .order("name")
        .execute()
        .data
    )
    window_rows = (
        client.table(TABLE)
        .select("*")
        .gte("entry_date", start.isoformat())
        .lte("entry_date", today.isoformat())
        .execute()
        .data
    )
    recent_rows = (
        client.table(TABLE)
        .select("*")
        .order("entry_date", desc=True)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
        .data
    )
    types_by_id = {t["id"]: t for t in types}

    goals: list[FitnessGoalBlock] = []
    for t in types:
        if t.get("daily_goal") is None:
            continue
        gunit = t["goal_unit"]
        goal = _num(t["daily_goal"])
        daily: dict[date, float] = {}
        for r in window_rows:
            if r["activity_type_id"] != t["id"]:
                continue
            d = date.fromisoformat(r["entry_date"])
            daily[d] = daily.get(d, 0.0) + _num((r.get("values") or {}).get(gunit, 0))
        streak = 0
        cursor = today
        while cursor in daily and daily[cursor] >= goal:
            streak += 1
            cursor -= timedelta(days=1)
        goals.append(
            FitnessGoalBlock(
                activity_type_id=t["id"],
                name=t["name"],
                unit=gunit,
                goal=goal,
                today_total=round(daily.get(today, 0.0), 2),
                days_met=sum(1 for d in day_list if daily.get(d, 0.0) >= goal),
                streak=streak,
                series=[
                    FitnessSeriesPoint(date=d, total=round(daily.get(d, 0.0), 2))
                    for d in day_list
                ],
            )
        )

    recent = [
        FitnessRecentEntry(
            id=r["id"],
            entry_date=date.fromisoformat(r["entry_date"]),
            activity_type_name=(types_by_id.get(r["activity_type_id"]) or {}).get("name"),
            values=r.get("values") or {},
            note=r.get("note"),
        )
        for r in recent_rows
    ]

    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    week_rows = (
        client.table(TABLE)
        .select("id")
        .gte("entry_date", week_start.isoformat())
        .lte("entry_date", week_end.isoformat())
        .execute()
        .data
    )

    return FitnessSummary(
        goals=goals,
        recent=recent,
        week_entry_count=len(week_rows),
        type_count=len(types),
    )


@router.get("/entries/{entry_id}", response_model=FitnessEntryRead)
def get_entry(entry_id: str):
    client = get_client()
    res = client.table(TABLE).select("*").eq("id", entry_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _ENTRY_NOT_FOUND)
    return _shape(res.data[0], _types_map(client))


@router.patch("/entries/{entry_id}", response_model=FitnessEntryRead)
def update_entry(entry_id: str, body: FitnessEntryUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    client = get_client()
    current = client.table(TABLE).select("*").eq("id", entry_id).execute().data
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _ENTRY_NOT_FOUND)
    row = current[0]
    type_id = payload.get("activity_type_id", row["activity_type_id"])
    activity = _type_or_404(client, type_id)
    _check_units(payload.get("values", row.get("values") or {}), activity["units"])
    try:
        res = client.table(TABLE).update(payload).eq("id", entry_id).execute()
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    return _shape(res.data[0], {activity["id"]: activity})


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: str):
    res = get_client().table(TABLE).delete().eq("id", entry_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _ENTRY_NOT_FOUND)
