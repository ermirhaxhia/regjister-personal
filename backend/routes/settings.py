from fastapi import APIRouter, Depends

from core.database import get_client
from core.security import require_auth
from models.settings import SleepGoalRead, SleepGoalUpdate

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    dependencies=[Depends(require_auth)],
)

TABLE = "app_settings"
SLEEP_GOAL_KEY = "sleep_goal_minutes"
_DEFAULT_SLEEP_GOAL = 480


@router.get("/sleep-goal", response_model=SleepGoalRead)
def get_sleep_goal():
    res = (
        get_client()
        .table(TABLE)
        .select("value")
        .eq("key", SLEEP_GOAL_KEY)
        .execute()
    )
    if not res.data:
        return {"goal_minutes": _DEFAULT_SLEEP_GOAL}
    return {"goal_minutes": res.data[0]["value"]}


@router.put("/sleep-goal", response_model=SleepGoalRead)
def update_sleep_goal(body: SleepGoalUpdate):
    client = get_client()
    client.table(TABLE).upsert(
        {"key": SLEEP_GOAL_KEY, "value": body.goal_minutes}, on_conflict="key"
    ).execute()
    return {"goal_minutes": body.goal_minutes}
