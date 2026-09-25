import statistics
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from core.database import get_client
from core.security import require_auth
from models.sleep import (
    SleepCreate,
    SleepInsightsRead,
    SleepNightPoint,
    SleepRead,
    SleepUpdate,
)

router = APIRouter(
    prefix="/sleep",
    tags=["sleep"],
    dependencies=[Depends(require_auth)],
)

TABLE = "sleep_log"
SLEEP_TARGET_MINUTES = 480


def _clock_hour(dt) -> float:
    """Kthen orën e ditës si float; nëse është mes mesnatës dhe mesditës,
    e zhvendos +24 që netët e vona të mos "hidhen" nga 23 në 0 në grafik."""
    raw = dt.hour + dt.minute / 60
    return raw + 24 if raw < 12 else raw


@router.get("", response_model=list[SleepRead])
def list_sleep():
    return get_client().table(TABLE).select("*").order("night_date", desc=True).execute().data


@router.post("", response_model=SleepRead, status_code=status.HTTP_201_CREATED)
def create_sleep(body: SleepCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["night_date"] = (body.night_date or body.sleep_start.date()).isoformat()
    return get_client().table(TABLE).insert(payload).execute().data[0]


@router.get("/insights", response_model=SleepInsightsRead)
def get_sleep_insights(days: int = 14):
    since = (date.today() - timedelta(days=days)).isoformat()
    rows = (
        get_client()
        .table(TABLE)
        .select("*")
        .gte("night_date", since)
        .order("night_date")
        .execute()
        .data
    )

    if not rows:
        return SleepInsightsRead(nights=[], bedtime_mean=None, bedtime_std=None)

    nights: list[SleepNightPoint] = []
    cumulative = 0.0
    for row in rows:
        start_dt = datetime.fromisoformat(row["sleep_start"])
        end_dt = datetime.fromisoformat(row["sleep_end"])
        duration = float(row["duration_minutes"])
        debt_hours_night = (SLEEP_TARGET_MINUTES - duration) / 60
        cumulative += debt_hours_night
        nights.append(
            SleepNightPoint(
                night_date=row["night_date"],
                bedtime_hour=_clock_hour(start_dt),
                waketime_hour=_clock_hour(end_dt),
                duration_minutes=duration,
                debt_hours_night=debt_hours_night,
                cumulative_debt_hours=cumulative,
            )
        )

    bedtime_hours = [n.bedtime_hour for n in nights]
    bedtime_mean = statistics.mean(bedtime_hours)
    bedtime_std = statistics.pstdev(bedtime_hours) if len(bedtime_hours) >= 2 else None

    return SleepInsightsRead(nights=nights, bedtime_mean=bedtime_mean, bedtime_std=bedtime_std)


@router.get("/{sleep_id}", response_model=SleepRead)
def get_sleep(sleep_id: str):
    res = get_client().table(TABLE).select("*").eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.patch("/{sleep_id}", response_model=SleepRead)
def update_sleep(sleep_id: str, body: SleepUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = get_client().table(TABLE).update(payload).eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.delete("/{sleep_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sleep(sleep_id: str):
    res = get_client().table(TABLE).delete().eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
