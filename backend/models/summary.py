from datetime import date

from pydantic import BaseModel


class SpendingBlock(BaseModel):
    today: float
    yesterday: float
    week_current: float
    week_previous: float
    month_current: float
    month_previous: float


class BudgetBlock(BaseModel):
    personal_allocation: float
    spent_since_salary: float
    remaining: float
    days_elapsed: int
    days_to_next_salary: int
    daily_rate: float
    daily_allowed: float
    projected_at_payday: float | None


class SeriesPoint(BaseModel):
    date: date
    amount: float


class ForecastPoint(BaseModel):
    date: date
    yhat: float
    lo: float
    hi: float


class ForecastBlock(BaseModel):
    ready: bool
    reason: str | None = None
    method: str | None = None
    horizon: int
    daily: float | None = None
    total: float | None = None
    total_lo: float | None = None
    total_hi: float | None = None
    points: list[ForecastPoint] = []
    history_days: int
    nonzero_days: int


class BiggestExpense(BaseModel):
    category: str
    amount: float
    date: date


class TopCategory(BaseModel):
    category: str
    amount: float
    pct: int


class Flag(BaseModel):
    id: str
    severity: str
    module: str
    text: str


class ForecastBacktestPoint(BaseModel):
    date: date
    actual: float
    yhat: float
    lo: float
    hi: float
    in_band: bool


class ForecastBacktestRead(BaseModel):
    coverage_pct: float | None
    target_coverage_pct: float
    mae_ewma: float | None
    mae_naive: float | None
    days_tested: int
    points: list[ForecastBacktestPoint] = []


class SummaryRead(BaseModel):
    balance_total: float
    balance_change_month: float
    spending: SpendingBlock
    budget: BudgetBlock | None = None
    series_30d: list[SeriesPoint]
    biggest_expense_week: BiggestExpense | None = None
    top_category_month: TopCategory | None = None
    forecast: ForecastBlock | None = None
    flags: list[Flag] = []
