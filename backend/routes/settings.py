from fastapi import APIRouter, Depends, HTTPException, status

from core.database import get_client
from core.security import require_auth
from models.settings import (
    OpeningBalanceCreate,
    OpeningBalanceRead,
    SleepGoalRead,
    SleepGoalUpdate,
)

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    dependencies=[Depends(require_auth)],
)

TABLE = "app_settings"
SLEEP_GOAL_KEY = "sleep_goal_minutes"
_DEFAULT_SLEEP_GOAL = 480
OPENING_BALANCE_KEY = "opening_balance"


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


@router.get("/opening-balance", response_model=OpeningBalanceRead)
def get_opening_balance():
    res = (
        get_client()
        .table(TABLE)
        .select("value")
        .eq("key", OPENING_BALANCE_KEY)
        .execute()
    )
    if not res.data:
        return {"amount": 0, "locked": False}
    return {"amount": res.data[0]["value"], "locked": True}


@router.post(
    "/opening-balance",
    response_model=OpeningBalanceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_opening_balance(body: OpeningBalanceCreate):
    client = get_client()
    existing = (
        client.table(TABLE).select("key").eq("key", OPENING_BALANCE_KEY).execute()
    )
    if existing.data:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Bilanci fillestar është vendosur tashmë dhe s'mund të ndryshohet.",
        )
    client.table(TABLE).insert(
        {"key": OPENING_BALANCE_KEY, "value": float(body.amount)}
    ).execute()
    return {"amount": body.amount, "locked": True}
