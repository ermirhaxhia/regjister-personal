from decimal import Decimal

from pydantic import BaseModel, Field


class SleepGoalRead(BaseModel):
    goal_minutes: int


class SleepGoalUpdate(BaseModel):
    goal_minutes: int = Field(ge=60, le=960)


class OpeningBalanceRead(BaseModel):
    amount: Decimal
    locked: bool


class OpeningBalanceCreate(BaseModel):
    amount: Decimal = Field(ge=0)
