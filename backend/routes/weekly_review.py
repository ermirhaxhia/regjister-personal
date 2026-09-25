from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.weekly_review import (
    WeeklyMetric,
    WeeklyReviewRead,
    WeeklyReviewUpsert,
    WeeklySummaryRead,
)

router = APIRouter(
    prefix="/weekly-review",
    tags=["weekly-review"],
    dependencies=[Depends(require_auth)],
)

TABLE = "weekly_review"
EXPENSES = "expenses"
SLEEP = "sleep_log"
HABIT_LOG = "habit_log"
HABITS = "habits"
FITNESS = "fitness_entries"

STEPS_KEY = "hapa"


def _raise_db_error(exc: APIError):
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme")


def _week_bounds(week_start: date) -> tuple[date, date]:
    return week_start, week_start + timedelta(days=6)


def _expenses_total(client, start: date, end: date) -> float | None:
    rows = (
        client.table(EXPENSES)
        .select("amount")
        .gte("entry_date", start.isoformat())
        .lte("entry_date", end.isoformat())
        .execute()
        .data
    )
    return sum(float(r["amount"]) for r in rows)


def _sleep_avg(client, start: date, end: date) -> float | None:
    rows = (
        client.table(SLEEP)
        .select("duration_minutes")
        .gte("night_date", start.isoformat())
        .lte("night_date", end.isoformat())
        .execute()
        .data
    )
    durations = [r["duration_minutes"] for r in rows if r.get("duration_minutes") is not None]
    if not durations:
        return None
    return sum(durations) / len(durations)


def _habit_rate_pct(client, start: date, end: date) -> float | None:
    active_habits = (
        client.table(HABITS)
        .select("id, tracking_type")
        .eq("is_active", True)
        .execute()
        .data
    )
    if not active_habits:
        return None
    log_rows = (
        client.table(HABIT_LOG)
        .select("entry_date, habit_id, done, duration_minutes")
        .gte("entry_date", start.isoformat())
        .lte("entry_date", end.isoformat())
        .execute()
        .data
    )
    logs_by_day: dict[str, dict[str, dict]] = {}
    for r in log_rows:
        logs_by_day.setdefault(r["entry_date"], {})[r["habit_id"]] = r

    daily_rates: list[float] = []
    day = start
    while day <= end:
        iso = day.isoformat()
        day_logs = logs_by_day.get(iso, {})
        met_count = 0
        for habit in active_habits:
            log = day_logs.get(habit["id"])
            if habit["tracking_type"] == "binary":
                met = bool(log and log.get("done") is True)
            else:
                duration = log.get("duration_minutes") if log else None
                met = duration is not None and duration > 0
            if met:
                met_count += 1
        daily_rates.append(met_count / len(active_habits) * 100)
        day += timedelta(days=1)

    return sum(daily_rates) / len(daily_rates)


def _steps_per_day(client, start: date, end: date) -> float | None:
    rows = (
        client.table(FITNESS)
        .select("values")
        .gte("entry_date", start.isoformat())
        .lte("entry_date", end.isoformat())
        .execute()
        .data
    )
    total = 0.0
    found = False
    for r in rows:
        values = r.get("values") or {}
        if STEPS_KEY in values:
            found = True
            total += float(values[STEPS_KEY])
    if not found:
        return None
    return total / 7


def _metric(current: float | None, previous: float | None) -> WeeklyMetric:
    return WeeklyMetric(current=current, previous=previous)


@router.get("/summary", response_model=WeeklySummaryRead)
def get_weekly_summary(week_start: date | None = Query(default=None)):
    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    client = get_client()
    start, end = _week_bounds(week_start)
    prev_start, prev_end = _week_bounds(week_start - timedelta(days=7))

    return WeeklySummaryRead(
        week_start=start,
        week_end=end,
        expenses=_metric(
            _expenses_total(client, start, end),
            _expenses_total(client, prev_start, prev_end),
        ),
        sleep_avg_minutes=_metric(
            _sleep_avg(client, start, end),
            _sleep_avg(client, prev_start, prev_end),
        ),
        habit_rate_pct=_metric(
            _habit_rate_pct(client, start, end),
            _habit_rate_pct(client, prev_start, prev_end),
        ),
        steps_per_day=_metric(
            _steps_per_day(client, start, end),
            _steps_per_day(client, prev_start, prev_end),
        ),
    )


@router.get("/{week_start}", response_model=WeeklyReviewRead)
def get_weekly_review(week_start: date):
    res = (
        get_client()
        .table(TABLE)
        .select("*")
        .eq("week_start", week_start.isoformat())
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk ka rishikim javor për këtë javë")
    return res.data[0]


@router.put("/{week_start}", response_model=WeeklyReviewRead)
def upsert_weekly_review(week_start: date, body: WeeklyReviewUpsert):
    payload = {
        **body.model_dump(mode="json", exclude_none=True),
        "week_start": week_start.isoformat(),
    }
    try:
        res = (
            get_client()
            .table(TABLE)
            .upsert(payload, on_conflict="week_start")
            .execute()
        )
    except APIError as exc:
        _raise_db_error(exc)
    return res.data[0]


@router.delete("/{week_start}", status_code=status.HTTP_204_NO_CONTENT)
def delete_weekly_review(week_start: date):
    res = (
        get_client()
        .table(TABLE)
        .delete()
        .eq("week_start", week_start.isoformat())
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk ka rishikim javor për këtë javë")
