from datetime import date

from fastapi import APIRouter, Depends

from core.database import get_client
from core.insights import fitness_habits, payday_window, sleep_spend, weekday_spend
from core.security import require_auth
from models.insights import Insight, InsightsRead

router = APIRouter(
    prefix="/insights",
    tags=["insights"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
SLEEP = "sleep_log"
HABIT_LOG = "habit_log"
HABITS = "habits"
FITNESS = "fitness_entries"
INCOME = "income"


@router.get("", response_model=InsightsRead)
def get_insights() -> InsightsRead:
    client = get_client()
    today = date.today()

    expenses = client.table(EXPENSES).select("amount, entry_date").execute().data
    sleep_rows = client.table(SLEEP).select("night_date, duration_minutes").execute().data
    habit_log_rows = (
        client.table(HABIT_LOG)
        .select("habit_id, entry_date, done, duration_minutes")
        .execute()
        .data
    )
    habits = client.table(HABITS).select("id, is_active").execute().data
    fitness_rows = client.table(FITNESS).select("entry_date").execute().data
    incomes = client.table(INCOME).select("received_on").execute().data

    candidates = [
        sleep_spend(sleep_rows, expenses, today),
        weekday_spend(expenses, today),
        payday_window(expenses, incomes, today),
        fitness_habits(fitness_rows, habit_log_rows, habits, today),
    ]
    insights = [
        Insight(**c) for c in candidates if c is not None and c["confidence"] != "low"
    ]
    return InsightsRead(insights=insights, enough_data=len(insights) > 0)
