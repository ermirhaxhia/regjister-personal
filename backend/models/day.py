from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class DayExpense(BaseModel):
    id: str
    amount: Decimal
    category: str
    description: str | None = None


class DayIncome(BaseModel):
    id: str
    amount: Decimal
    kind: str
    source: str | None = None
    note: str | None = None


class DaySleep(BaseModel):
    id: str
    sleep_start: datetime
    sleep_end: datetime
    duration_minutes: float
    note: str | None = None


class DayHabit(BaseModel):
    id: str
    habit_id: str
    name: str
    tracking_type: str
    done: bool | None = None
    duration_minutes: int | None = None
    note: str | None = None


class DayFitness(BaseModel):
    id: str
    activity_type_name: str
    values: dict = {}
    note: str | None = None


class DayNote(BaseModel):
    id: str
    colleague_name: str
    note: str


class DayView(BaseModel):
    date: date
    expenses: list[DayExpense] = []
    expenses_total: Decimal = Decimal("0")
    incomes: list[DayIncome] = []
    income_total: Decimal = Decimal("0")
    sleep: list[DaySleep] = []
    habits: list[DayHabit] = []
    fitness: list[DayFitness] = []
    notes: list[DayNote] = []
