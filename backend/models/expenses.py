from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(ge=0)
    category: str = Field(min_length=1)
    entry_date: date | None = None
    description: str | None = None


class ExpenseUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, min_length=1)
    entry_date: date | None = None
    description: str | None = None


class ExpenseRead(BaseModel):
    id: str
    amount: Decimal
    category: str
    entry_date: date
    description: str | None = None
    created_at: datetime
    updated_at: datetime


def _clean_category_name(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("Emri i kategorisë nuk mund të jetë bosh")
    if len(v) > 60:
        raise ValueError("Emri i kategorisë s'mund të kalojë 60 karaktere")
    return v


CategoryName = Annotated[str, Field(min_length=1), AfterValidator(_clean_category_name)]


class ExpenseCategoryCreate(BaseModel):
    name: CategoryName


class ExpenseCategoryUpdate(BaseModel):
    name: CategoryName


class ExpenseCategoryOut(BaseModel):
    id: str
    name: str
    sort_order: int
    created_at: datetime
    updated_at: datetime
    expense_count: int = 0
