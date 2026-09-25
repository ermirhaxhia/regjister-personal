from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query

from core.database import get_client
from core.security import require_auth
from models.dashboard import (
    CategoryShare,
    DashboardDay,
    DashboardRead,
    ExpenseHeatmapRead,
    HeatmapDay,
    SavingsRateMonth,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
INCOME = "income"
ALLOCATIONS = "income_allocations"
SLEEP = "sleep_log"
HABIT_LOG = "habit_log"
MOOD = "mood_log"
SETTINGS = "app_settings"
OPENING_BALANCE_KEY = "opening_balance"

SAVINGS_RATE_MONTHS = 6


def _num(v) -> Decimal:
    try:
        return Decimal(str(v))
    except (TypeError, ValueError):
        return Decimal("0")


def _month_key(d: date) -> str:
    return f"{d.year:04d}-{d.month:02d}"


def _prev_month_start(d: date) -> date:
    if d.month == 1:
        return date(d.year - 1, 12, 1)
    return date(d.year, d.month - 1, 1)


@router.get("", response_model=DashboardRead)
def get_dashboard():
    client = get_client()
    expenses = (
        client.table(EXPENSES).select("amount, category, entry_date").execute().data
    )
    incomes = client.table(INCOME).select("id, amount, received_on").execute().data
    personale_allocs = (
        client.table(ALLOCATIONS)
        .select("amount, income_id")
        .eq("bucket", "personale")
        .execute()
        .data
    )
    opening_balance_row = (
        client.table(SETTINGS).select("value").eq("key", OPENING_BALANCE_KEY).execute().data
    )
    opening_balance = _num(opening_balance_row[0]["value"]) if opening_balance_row else Decimal("0")

    today = date.today()
    month_start = today.replace(day=1)
    d30_start = today - timedelta(days=29)

    sleep_dates = (
        client.table(SLEEP)
        .select("night_date")
        .gte("night_date", d30_start.isoformat())
        .lte("night_date", today.isoformat())
        .execute()
        .data
    )
    habit_dates = (
        client.table(HABIT_LOG)
        .select("entry_date")
        .gte("entry_date", d30_start.isoformat())
        .lte("entry_date", today.isoformat())
        .execute()
        .data
    )
    mood_dates = (
        client.table(MOOD)
        .select("log_date")
        .gte("log_date", d30_start.isoformat())
        .lte("log_date", today.isoformat())
        .execute()
        .data
    )

    expense_by_date: dict[date, Decimal] = defaultdict(lambda: Decimal("0"))
    income_by_date: dict[date, Decimal] = defaultdict(lambda: Decimal("0"))
    category_month: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))

    for e in expenses:
        d = date.fromisoformat(e["entry_date"])
        amt = _num(e["amount"])
        expense_by_date[d] += amt
        if month_start <= d <= today:
            category_month[e["category"]] += amt

    for i in incomes:
        d = date.fromisoformat(i["received_on"])
        income_by_date[d] += _num(i["amount"])

    daily = [
        DashboardDay(
            date=today - timedelta(days=i),
            expense=expense_by_date.get(today - timedelta(days=i), Decimal("0")),
            income=income_by_date.get(today - timedelta(days=i), Decimal("0")),
        )
        for i in range(29, -1, -1)
    ]

    expense_mean_30d = sum((d.expense for d in daily), Decimal("0")) / Decimal(30)

    total_month = sum(category_month.values(), Decimal("0"))
    categories_month = sorted(
        (
            CategoryShare(
                category=cat,
                amount=amt,
                pct=int(round(amt / total_month * 100)) if total_month else 0,
            )
            for cat, amt in category_month.items()
        ),
        key=lambda c: c.amount,
        reverse=True,
    )

    income_received = {i["id"]: date.fromisoformat(i["received_on"]) for i in incomes}
    personal_income_by_month: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for a in personale_allocs:
        rd = income_received.get(a["income_id"])
        if rd is None:
            continue
        personal_income_by_month[_month_key(rd)] += _num(a["amount"])

    expense_by_month: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for d, amt in expense_by_date.items():
        expense_by_month[_month_key(d)] += amt

    months: list[str] = []
    cursor = today.replace(day=1)
    for _ in range(SAVINGS_RATE_MONTHS):
        months.append(_month_key(cursor))
        cursor = _prev_month_start(cursor)
    months.reverse()

    savings_rate = []
    for mk in months:
        inc = personal_income_by_month.get(mk, Decimal("0"))
        exp = expense_by_month.get(mk, Decimal("0"))
        rate = int(round((1 - exp / inc) * 100)) if inc else None
        savings_rate.append(SavingsRateMonth(month=mk, rate_pct=rate))

    total_personale = sum((_num(a["amount"]) for a in personale_allocs), Decimal("0"))
    total_expense_all = sum(expense_by_date.values(), Decimal("0"))
    balance_total = opening_balance + total_personale - total_expense_all
    runway_days = (
        int(round(balance_total / expense_mean_30d)) if expense_mean_30d > 0 else None
    )

    sleep_day_set = {date.fromisoformat(r["night_date"]) for r in sleep_dates}
    habit_day_set = {date.fromisoformat(r["entry_date"]) for r in habit_dates}
    mood_day_set = {date.fromisoformat(r["log_date"]) for r in mood_dates}
    days_with_record = set(expense_by_date) | sleep_day_set | habit_day_set | mood_day_set
    days_covered = sum(
        1 for i in range(30) if (d30_start + timedelta(days=i)) in days_with_record
    )
    data_completeness_pct = int(round(days_covered / 30 * 100))

    return DashboardRead(
        daily=daily,
        expense_mean_30d=expense_mean_30d,
        categories_month=categories_month,
        savings_rate=savings_rate,
        runway_days=runway_days,
        data_completeness_pct=data_completeness_pct,
    )


@router.get("/expense-heatmap", response_model=ExpenseHeatmapRead)
def get_expense_heatmap(months: int = Query(default=6, ge=1, le=12)):
    """Shpenzimi ditor per heatmap kalendarik (stil GitHub).

    Periudha: nga fillimi i muajit (sot - (months-1) muaj) deri sot, perfshire.
    Kthen çdo ditë të periudhës, edhe ato pa shpenzime (amount=0).
    """
    client = get_client()
    today = date.today()
    start_date = today.replace(day=1)
    for _ in range(months - 1):
        start_date = _prev_month_start(start_date)

    expenses = (
        client.table(EXPENSES)
        .select("amount, entry_date")
        .gte("entry_date", start_date.isoformat())
        .lte("entry_date", today.isoformat())
        .execute()
        .data
    )

    expense_by_date: dict[date, Decimal] = defaultdict(lambda: Decimal("0"))
    for e in expenses:
        expense_by_date[date.fromisoformat(e["entry_date"])] += _num(e["amount"])

    total_days = (today - start_date).days + 1
    days = [
        HeatmapDay(
            date=start_date + timedelta(days=i),
            amount=expense_by_date.get(start_date + timedelta(days=i), Decimal("0")),
        )
        for i in range(total_days)
    ]

    return ExpenseHeatmapRead(days=days)
