from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.habits import (
    HabitCreate,
    HabitGridCell,
    HabitGridRead,
    HabitGridRow,
    HabitLogRead,
    HabitLogUpsert,
    HabitRead,
    HabitUpdate,
)

router = APIRouter(
    prefix="/habits",
    tags=["habits"],
    dependencies=[Depends(require_auth)],
)

TABLE = "habits"
LOG_TABLE = "habit_log"


def _habit_or_404(client, habit_id: str) -> dict:
    res = client.table(TABLE).select("*").eq("id", habit_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Zakoni nuk u gjet")
    return res.data[0]


def _raise_db_error(exc: APIError):
    if exc.code == "23505":
        raise HTTPException(status.HTTP_409_CONFLICT, "Ekziston një zakon me këtë emër")
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme")


@router.get("", response_model=list[HabitRead])
def list_habits(active: bool | None = Query(default=None)):
    q = get_client().table(TABLE).select("*").order("name")
    if active is not None:
        q = q.eq("is_active", active)
    return q.execute().data


@router.post("", response_model=HabitRead, status_code=status.HTTP_201_CREATED)
def create_habit(body: HabitCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        return get_client().table(TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)


@router.get("/log", response_model=list[HabitLogRead])
def list_habit_log(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    habit_id: str | None = Query(default=None),
):
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)
    q = (
        get_client()
        .table(LOG_TABLE)
        .select("*")
        .gte("entry_date", date_from.isoformat())
        .lte("entry_date", date_to.isoformat())
        .order("entry_date", desc=True)
    )
    if habit_id:
        q = q.eq("habit_id", habit_id)
    return q.execute().data


@router.get("/grid", response_model=HabitGridRead)
def habit_grid(days: int = Query(default=14, ge=7, le=60)):
    client = get_client()
    today = date.today()
    start = today - timedelta(days=days - 1)
    day_list = [start + timedelta(days=i) for i in range(days)]

    habits = (
        client.table(TABLE)
        .select("*")
        .eq("is_active", True)
        .order("name")
        .execute()
        .data
    )
    logs = (
        client.table(LOG_TABLE)
        .select("*")
        .gte("entry_date", start.isoformat())
        .lte("entry_date", today.isoformat())
        .execute()
        .data
    )

    by_habit: dict[str, dict[str, dict]] = {}
    for row in logs:
        by_habit.setdefault(row["habit_id"], {})[str(row["entry_date"])] = row

    rows: list[HabitGridRow] = []
    for habit in habits:
        entries = by_habit.get(habit["id"], {})
        cells: list[HabitGridCell] = []
        for day in day_list:
            entry = entries.get(day.isoformat())
            done = entry["done"] if entry else None
            duration = entry["duration_minutes"] if entry else None
            count = entry["count"] if entry else None
            if habit["tracking_type"] == "binary":
                met = done is True
            elif habit["tracking_type"] == "numer":
                met = count is not None and count > 0
            else:
                met = duration is not None and duration > 0
            cells.append(
                HabitGridCell(
                    date=day, done=done, duration_minutes=duration, count=count, met=met
                )
            )
        streak = 0
        for cell in reversed(cells):
            if cell.met:
                streak += 1
            else:
                break
        hit = sum(1 for cell in cells if cell.met)
        rate = round(hit / len(cells) * 100) if cells else 0
        rows.append(
            HabitGridRow(
                id=habit["id"],
                name=habit["name"],
                tracking_type=habit["tracking_type"],
                unit_label=habit.get("unit_label"),
                cells=cells,
                streak_current=streak,
                rate_pct=rate,
            )
        )
    return HabitGridRead(days=day_list, habits=rows)


@router.get("/{habit_id}", response_model=HabitRead)
def get_habit(habit_id: str):
    return _habit_or_404(get_client(), habit_id)


@router.patch("/{habit_id}", response_model=HabitRead)
def update_habit(habit_id: str, body: HabitUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    try:
        res = get_client().table(TABLE).update(payload).eq("id", habit_id).execute()
    except APIError as exc:
        _raise_db_error(exc)
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Zakoni nuk u gjet")
    return res.data[0]


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: str):
    res = get_client().table(TABLE).delete().eq("id", habit_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Zakoni nuk u gjet")


@router.put("/{habit_id}/log/{entry_date}", response_model=HabitLogRead)
def upsert_habit_log(habit_id: str, entry_date: date, body: HabitLogUpsert):
    client = get_client()
    habit = _habit_or_404(client, habit_id)
    if habit["tracking_type"] == "binary" and body.done is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Zakoni binar kërkon fushën 'done'"
        )
    if habit["tracking_type"] == "duration" and body.duration_minutes is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Zakoni me kohëzgjatje kërkon fushën 'duration_minutes'",
        )
    if habit["tracking_type"] == "numer" and body.count is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Zakoni i llojit numër kërkon fushën 'count'"
        )
    payload = {
        **body.model_dump(mode="json", exclude_none=True),
        "habit_id": habit_id,
        "entry_date": entry_date.isoformat(),
    }
    try:
        res = (
            client.table(LOG_TABLE)
            .upsert(payload, on_conflict="habit_id,entry_date")
            .execute()
        )
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    return res.data[0]


@router.delete(
    "/{habit_id}/log/{entry_date}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_habit_log(habit_id: str, entry_date: date):
    res = (
        get_client()
        .table(LOG_TABLE)
        .delete()
        .eq("habit_id", habit_id)
        .eq("entry_date", entry_date.isoformat())
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hyrja nuk u gjet")
