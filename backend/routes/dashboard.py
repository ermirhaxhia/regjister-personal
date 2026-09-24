from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends

from core.database import get_client
from core.security import require_auth
from models.dashboard import CategoryShare, DashboardDay, DashboardRead

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
INCOME = "income"


def _num(v) -> Decimal:
    try:
        return Decimal(str(v))
    except (TypeError, ValueError):
        return Decimal("0")


@router.get("", response_model=DashboardRead)
def get_dashboard():
    client = get_client()
    expenses = (
        client.table(EXPENSES).select("amount, category, entry_date").execute().data
    )
    incomes = client.table(INCOME).select("amount, received_on").execute().data

    today = date.today()
    month_start = today.replace(day=1)

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

    return DashboardRead(
        daily=daily,
        expense_mean_30d=expense_mean_30d,
        categories_month=categories_month,
    )
