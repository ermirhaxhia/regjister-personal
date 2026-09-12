from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator

UNITS = [
    {"key": "hapa", "label": "Hapa", "decimal": False},
    {"key": "km", "label": "Kilometra", "decimal": True},
    {"key": "kohe", "label": "Kohë (min)", "decimal": False},
    {"key": "metra", "label": "Metra", "decimal": False},
    {"key": "perseritje", "label": "Përsëritje", "decimal": False},
    {"key": "sete", "label": "Sete", "decimal": False},
    {"key": "pesha", "label": "Pesha (kg)", "decimal": True},
    {"key": "kalori", "label": "Kalori", "decimal": False},
]
UNIT_KEYS = tuple(u["key"] for u in UNITS)


def _clean_units(v: list[str]) -> list[str]:
    if not v:
        raise ValueError("Duhet të paktën një njësi")
    bad = [u for u in v if u not in UNIT_KEYS]
    if bad:
        raise ValueError(f"Njësi jashtë vokabularit: {', '.join(bad)}")
    out: list[str] = []
    for u in v:
        if u not in out:
            out.append(u)
    return out


def _clean_values(v: dict[str, float | int]) -> dict[str, float | int]:
    if not v:
        raise ValueError("Duhet të paktën një vlerë")
    for key, num in v.items():
        if isinstance(num, bool) or num < 0:
            raise ValueError(f"Vlera për '{key}' duhet numër jo-negativ")
    return v


class ActivityTypeCreate(BaseModel):
    name: str = Field(min_length=1)
    units: list[str] = Field(min_length=1)
    daily_goal: float | None = Field(default=None, ge=0)
    goal_unit: str | None = None
    sort_order: int | None = None

    @field_validator("units")
    @classmethod
    def _v_units(cls, v: list[str]) -> list[str]:
        return _clean_units(v)

    @field_validator("goal_unit")
    @classmethod
    def _v_goal_unit(cls, v: str | None) -> str | None:
        if v is not None and v not in UNIT_KEYS:
            raise ValueError("goal_unit jashtë vokabularit")
        return v

    @model_validator(mode="after")
    def _v_goal(self):
        if self.daily_goal is not None:
            if not self.goal_unit:
                raise ValueError("daily_goal kërkon goal_unit")
            if self.goal_unit not in self.units:
                raise ValueError("goal_unit duhet të jetë një nga units")
        return self


class ActivityTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    units: list[str] | None = None
    daily_goal: float | None = Field(default=None, ge=0)
    goal_unit: str | None = None
    sort_order: int | None = None

    @field_validator("units")
    @classmethod
    def _v_units(cls, v: list[str] | None) -> list[str] | None:
        return v if v is None else _clean_units(v)

    @field_validator("goal_unit")
    @classmethod
    def _v_goal_unit(cls, v: str | None) -> str | None:
        if v is not None and v not in UNIT_KEYS:
            raise ValueError("goal_unit jashtë vokabularit")
        return v


class ActivityTypeRead(BaseModel):
    id: str
    name: str
    units: list[str]
    daily_goal: float | None = None
    goal_unit: str | None = None
    sort_order: int = 0


class FitnessEntryCreate(BaseModel):
    activity_type_id: str
    values: dict[str, float | int]
    entry_date: date | None = None
    note: str | None = None

    @field_validator("values")
    @classmethod
    def _v_values(cls, v: dict[str, float | int]) -> dict[str, float | int]:
        return _clean_values(v)


class FitnessEntryUpdate(BaseModel):
    activity_type_id: str | None = None
    values: dict[str, float | int] | None = None
    entry_date: date | None = None
    note: str | None = None

    @field_validator("values")
    @classmethod
    def _v_values(cls, v: dict[str, float | int] | None) -> dict[str, float | int] | None:
        return v if v is None else _clean_values(v)


class FitnessEntryRead(BaseModel):
    id: str
    entry_date: date
    activity_type_id: str
    activity_type_name: str | None = None
    values: dict = {}
    note: str | None = None
    created_at: datetime
    updated_at: datetime


class FitnessSeriesPoint(BaseModel):
    date: date
    total: float


class FitnessGoalBlock(BaseModel):
    activity_type_id: str
    name: str
    unit: str
    goal: float
    today_total: float
    days_met: int
    streak: int
    series: list[FitnessSeriesPoint]


class FitnessRecentEntry(BaseModel):
    id: str
    entry_date: date
    activity_type_name: str | None = None
    values: dict = {}
    note: str | None = None


class FitnessSummary(BaseModel):
    goals: list[FitnessGoalBlock]
    recent: list[FitnessRecentEntry]
    week_entry_count: int
    type_count: int
