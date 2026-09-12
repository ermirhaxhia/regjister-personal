from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, Field


class IncomeCreate(BaseModel):
    amount: Decimal = Field(ge=0)
    period_month: date
    received_on: date | None = None
    source: str | None = None
    note: str | None = None
    kind: Literal["paga", "tjeter"] = "paga"


class IncomeUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, ge=0)
    period_month: date | None = None
    received_on: date | None = None
    source: str | None = None
    note: str | None = None
    kind: Literal["paga", "tjeter"] | None = None


class AllocationRead(BaseModel):
    id: str
    bucket: str
    amount: Decimal
    percentage: Decimal


class IncomeRead(BaseModel):
    id: str
    amount: Decimal
    period_month: date
    received_on: date
    source: str | None = None
    note: str | None = None
    kind: Literal["paga", "tjeter"] = "paga"
    created_at: datetime
    updated_at: datetime
    allocations: list[AllocationRead] = []


def _clean_source_name(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("Emri i burimit nuk mund të jetë bosh")
    if len(v) > 60:
        raise ValueError("Emri i burimit s'mund të kalojë 60 karaktere")
    return v


SourceName = Annotated[str, Field(min_length=1), AfterValidator(_clean_source_name)]


class IncomeSourceCreate(BaseModel):
    name: SourceName


class IncomeSourceUpdate(BaseModel):
    name: SourceName


class IncomeSourceOut(BaseModel):
    id: str
    name: str
    sort_order: int
    created_at: datetime
    updated_at: datetime
    income_count: int = 0
