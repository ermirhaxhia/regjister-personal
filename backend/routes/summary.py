import calendar
from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends

from core.database import get_client
from core.flags import build_flags
from core.forecast import ewma_forecast
from core.security import require_auth
from models.summary import BudgetBlock, Flag, ForecastBlock, ForecastPoint, SummaryRead

router = APIRouter(
    prefix="/summary",
    tags=["summary"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
INCOME = "income"
ALLOCATIONS = "income_allocations"
SLEEP = "sleep_log"
HABIT_LOG = "habit_log"
HABITS = "habits"

HORIZON = 5
MIN_HISTORY_DAYS = 14
MIN_NONZERO_DAYS = 8


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _r(v: float) -> float:
    return round(v, 2)


def _add_month(d: date) -> date:
    y, m = (d.year + 1, 1) if d.month == 12 else (d.year, d.month + 1)
    last = calendar.monthrange(y, m)[1]
    return date(y, m, min(d.day, last))


def _sum_between(by_date: dict[date, float], lo: date, hi: date) -> float:
    return sum(v for k, v in by_date.items() if lo <= k <= hi)


@router.get("", response_model=SummaryRead)
def get_summary():
    client = get_client()
    expenses = client.table(EXPENSES).select("amount, category, entry_date").execute().data
    incomes = client.table(INCOME).select("id, amount, received_on").execute().data
    personale_allocs = (
        client.table(ALLOCATIONS)
        .select("amount, income_id")
        .eq("bucket", "personale")
        .execute()
        .data
    )
    sleep_rows = client.table(SLEEP).select("night_date, duration_minutes").execute().data
    habit_log_rows = (
        client.table(HABIT_LOG)
        .select("habit_id, entry_date, done, duration_minutes")
        .execute()
        .data
    )
    habit_rows = client.table(HABITS).select("id, name, is_active").execute().data

    today = date.today()
    yesterday = today - timedelta(days=1)
    week_start = today - timedelta(days=today.weekday())
    prev_week_start = week_start - timedelta(days=7)
    prev_week_end = week_start - timedelta(days=1)
    month_start = today.replace(day=1)
    prev_month_end = month_start - timedelta(days=1)
    prev_month_start = prev_month_end.replace(day=1)

    by_date: dict[date, float] = defaultdict(float)
    rows: list[tuple[date, float, str]] = []
    for e in expenses:
        d = date.fromisoformat(e["entry_date"])
        amt = _num(e["amount"])
        by_date[d] += amt
        rows.append((d, amt, e["category"]))

    total_expense = sum(a for _, a, _ in rows)

    income_received = {
        i["id"]: date.fromisoformat(i["received_on"]) for i in incomes
    }
    total_personale = sum(_num(a["amount"]) for a in personale_allocs)
    personale_this_month = sum(
        _num(a["amount"])
        for a in personale_allocs
        if (rd := income_received.get(a["income_id"])) is not None
        and rd.year == today.year
        and rd.month == today.month
    )
    month_current = _sum_between(by_date, month_start, today)

    spending = {
        "today": _r(by_date.get(today, 0.0)),
        "yesterday": _r(by_date.get(yesterday, 0.0)),
        "week_current": _r(_sum_between(by_date, week_start, today)),
        "week_previous": _r(_sum_between(by_date, prev_week_start, prev_week_end)),
        "month_current": _r(month_current),
        "month_previous": _r(_sum_between(by_date, prev_month_start, prev_month_end)),
    }

    balance_total = _r(total_personale - total_expense)
    balance_change_month = _r(personale_this_month - month_current)

    series_30d = [
        {
            "date": today - timedelta(days=i),
            "amount": _r(by_date.get(today - timedelta(days=i), 0.0)),
        }
        for i in range(29, -1, -1)
    ]

    week_rows = [x for x in rows if week_start <= x[0] <= today]
    biggest_expense_week = None
    if week_rows:
        d, amt, cat = max(week_rows, key=lambda x: x[1])
        biggest_expense_week = {"category": cat, "amount": _r(amt), "date": d}

    month_rows = [x for x in rows if month_start <= x[0] <= today]
    top_category_month = None
    if month_rows:
        cat_tot: dict[str, float] = defaultdict(float)
        for _, amt, cat in month_rows:
            cat_tot[cat] += amt
        total = sum(cat_tot.values())
        cat, amt = max(cat_tot.items(), key=lambda kv: kv[1])
        pct = int(round(amt / total * 100)) if total else 0
        top_category_month = {"category": cat, "amount": _r(amt), "pct": pct}

    budget = None
    if incomes:
        latest = max(incomes, key=lambda i: i["received_on"])
        received_on = date.fromisoformat(latest["received_on"])
        alloc = (
            client.table(ALLOCATIONS)
            .select("amount")
            .eq("income_id", latest["id"])
            .eq("bucket", "personale")
            .execute()
            .data
        )
        personal_allocation = _num(alloc[0]["amount"]) if alloc else 0.0
        spent_since_salary = _sum_between(by_date, received_on, today)
        remaining = personal_allocation - spent_since_salary
        days_elapsed = max((today - received_on).days, 1)
        days_to_next_salary = max((_add_month(received_on) - today).days, 0)
        daily_rate = spent_since_salary / days_elapsed
        daily_allowed = personal_allocation / 30
        projected_at_payday = remaining - daily_rate * days_to_next_salary
        budget = BudgetBlock(
            personal_allocation=_r(personal_allocation),
            spent_since_salary=_r(spent_since_salary),
            remaining=_r(remaining),
            days_elapsed=days_elapsed,
            days_to_next_salary=days_to_next_salary,
            daily_rate=_r(daily_rate),
            daily_allowed=_r(daily_allowed),
            projected_at_payday=_r(projected_at_payday),
        )

    forecast = None
    if by_date:
        first_day = min(by_date)
        history_days = (today - first_day).days + 1
        daily = [
            by_date.get(first_day + timedelta(days=i), 0.0)
            for i in range(history_days)
        ]
        nonzero_days = sum(1 for v in daily if v > 0)
        if history_days < MIN_HISTORY_DAYS or nonzero_days < MIN_NONZERO_DAYS:
            forecast = ForecastBlock(
                ready=False,
                reason=(
                    f"Parashikimi ndizet me {MIN_HISTORY_DAYS} ditë të dhëna dhe "
                    f"{MIN_NONZERO_DAYS} ditë me shpenzim — ke {history_days} / "
                    f"{nonzero_days}."
                ),
                horizon=HORIZON,
                history_days=history_days,
                nonzero_days=nonzero_days,
            )
        else:
            fc = ewma_forecast(daily, HORIZON)
            forecast = ForecastBlock(
                ready=True,
                method=fc["method"],
                horizon=HORIZON,
                daily=fc["daily"],
                total=fc["total"],
                total_lo=fc["total_lo"],
                total_hi=fc["total_hi"],
                points=[
                    ForecastPoint(
                        date=today + timedelta(days=p["offset"]),
                        yhat=p["yhat"],
                        lo=p["lo"],
                        hi=p["hi"],
                    )
                    for p in fc["points"]
                ],
                history_days=history_days,
                nonzero_days=nonzero_days,
            )

    raw_flags = build_flags(
        today=today,
        by_date=by_date,
        budget=budget,
        spending=spending,
        sleep_rows=sleep_rows,
        habit_log_rows=habit_log_rows,
        habits=habit_rows,
    )

    return SummaryRead(
        balance_total=balance_total,
        balance_change_month=balance_change_month,
        spending=spending,
        budget=budget,
        series_30d=series_30d,
        biggest_expense_week=biggest_expense_week,
        top_category_month=top_category_month,
        forecast=forecast,
        flags=[Flag(**f) for f in raw_flags],
    )
