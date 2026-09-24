from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DashboardDay(BaseModel):
    date: date
    expense: Decimal
    income: Decimal


class CategoryShare(BaseModel):
    category: str
    amount: Decimal
    pct: int


class DashboardRead(BaseModel):
    daily: list[DashboardDay]
    expense_mean_30d: Decimal
    categories_month: list[CategoryShare]
