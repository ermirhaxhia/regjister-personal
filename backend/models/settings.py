from pydantic import BaseModel, Field


class SleepGoalRead(BaseModel):
    goal_minutes: int


class SleepGoalUpdate(BaseModel):
    goal_minutes: int = Field(ge=60, le=960)
