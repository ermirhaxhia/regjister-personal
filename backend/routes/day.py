from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends

from core.database import get_client
from core.security import require_auth
from models.day import (
    DayExpense,
    DayFitness,
    DayHabit,
    DayIncome,
    DayNote,
    DaySleep,
    DayView,
)

router = APIRouter(
    prefix="/day",
    tags=["day"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
INCOME = "income"
SLEEP = "sleep_log"
HABIT_LOG = "habit_log"
HABITS = "habits"
FITNESS = "fitness_entries"
ACTIVITY_TYPES = "activity_types"
CONTACT_LOG = "contact_log"
COLLEAGUES = "colleagues"


def _dec(v) -> Decimal:
    try:
        return Decimal(str(v))
    except (TypeError, ValueError, ArithmeticError):
        return Decimal("0")


def _colleague_name(row: dict) -> str:
    name = (row.get("name") or "").strip()
    last = (row.get("last_name") or "").strip()
    return f"{name} {last}" if last else name


@router.get("/{d}", response_model=DayView)
def get_day(d: date) -> DayView:
    """Ditari i një dite: mbledh të 6 modulet për një datë në një përgjigje."""
    client = get_client()
    iso = d.isoformat()

    expense_rows = (
        client.table(EXPENSES)
        .select("id, amount, category, description, created_at")
        .eq("entry_date", iso)
        .order("created_at")
        .execute()
        .data
    )
    income_rows = (
        client.table(INCOME)
        .select("id, amount, kind, source, note, created_at")
        .eq("received_on", iso)
        .order("created_at")
        .execute()
        .data
    )
    sleep_rows = (
        client.table(SLEEP)
        .select("id, sleep_start, sleep_end, duration_minutes, note, created_at")
        .eq("night_date", iso)
        .order("created_at")
        .execute()
        .data
    )
    habit_rows = (
        client.table(HABIT_LOG)
        .select("id, habit_id, done, duration_minutes, note, created_at")
        .eq("entry_date", iso)
        .order("created_at")
        .execute()
        .data
    )
    fitness_rows = (
        client.table(FITNESS)
        .select("*")
        .eq("entry_date", iso)
        .order("created_at")
        .execute()
        .data
    )
    contact_rows = (
        client.table(CONTACT_LOG)
        .select("id, colleague_id, note, created_at")
        .eq("contact_date", iso)
        .order("created_at")
        .execute()
        .data
    )

    active_habits = (
        client.table(HABITS)
        .select("id, name, tracking_type, unit_label")
        .eq("is_active", True)
        .order("name")
        .execute()
        .data
    )
    habit_log_map: dict[str, dict] = {r["habit_id"]: r for r in habit_rows}
    types_map: dict[str, str] = {}
    if fitness_rows:
        types_map = {
            t["id"]: t["name"]
            for t in client.table(ACTIVITY_TYPES).select("id, name").execute().data
        }
    colleagues_map: dict[str, dict] = {}
    if contact_rows:
        colleagues_map = {
            c["id"]: c
            for c in client.table(COLLEAGUES)
            .select("id, name, last_name")
            .execute()
            .data
        }

    expenses = [
        DayExpense(
            id=r["id"],
            amount=_dec(r["amount"]),
            category=r["category"],
            description=r.get("description"),
        )
        for r in expense_rows
    ]
    incomes = [
        DayIncome(
            id=r["id"],
            amount=_dec(r["amount"]),
            kind=r["kind"],
            source=r.get("source"),
            note=r.get("note"),
        )
        for r in income_rows
    ]
    sleep = [
        DaySleep(
            id=r["id"],
            sleep_start=r["sleep_start"],
            sleep_end=r["sleep_end"],
            duration_minutes=r["duration_minutes"],
            note=r.get("note"),
        )
        for r in sleep_rows
    ]
    habits = []
    for habit in active_habits:
        log = habit_log_map.get(habit["id"])
        done = log.get("done") if log else None
        duration = log.get("duration_minutes") if log else None
        if habit["tracking_type"] == "binary":
            met = done is True
        else:
            met = duration is not None and duration > 0
        habits.append(
            DayHabit(
                id=log.get("id") if log else None,
                habit_id=habit["id"],
                name=habit["name"],
                tracking_type=habit["tracking_type"],
                unit_label=habit.get("unit_label"),
                done=done,
                duration_minutes=duration,
                note=log.get("note") if log else None,
                met=met,
            )
        )
    fitness = [
        DayFitness(
            id=r["id"],
            activity_type_name=types_map.get(r["activity_type_id"], ""),
            values=r.get("values") or {},
            note=r.get("note"),
        )
        for r in fitness_rows
    ]
    notes = [
        DayNote(
            id=r["id"],
            colleague_id=r["colleague_id"],
            colleague_name=_colleague_name(colleagues_map.get(r["colleague_id"]) or {}),
            note=r["note"],
        )
        for r in contact_rows
    ]

    expenses_total = sum((e.amount for e in expenses), Decimal("0"))
    income_total = sum((i.amount for i in incomes), Decimal("0"))

    return DayView(
        date=d,
        expenses=expenses,
        expenses_total=expenses_total,
        incomes=incomes,
        income_total=income_total,
        sleep=sleep,
        habits=habits,
        fitness=fitness,
        notes=notes,
    )
