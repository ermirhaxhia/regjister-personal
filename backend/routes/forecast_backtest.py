"""Backtest walk-forward i parashikimit EWMA për shpenzimet.

Për çdo ditë të historisë (pas fillimit minimal) parashikohet dita nga
e dhëna PARA saj, krahasohet me shpenzimin real dhe me parashikimin naiv
(mesatarja 7-ditore). Në fund agregohen mbulimi i brezit 80% dhe MAE.
"""

from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends

from core.database import get_client
from core.forecast import ewma_forecast
from core.security import require_auth
from models.summary import ForecastBacktestPoint, ForecastBacktestRead

router = APIRouter(
    prefix="/summary",
    tags=["summary"],
    dependencies=[Depends(require_auth)],
)

EXPENSES = "expenses"
SPAN = 14
Z = 1.28
TARGET_COVERAGE_PCT = 80.0
MIN_HISTORY_DAYS = SPAN + 7
MAX_POINTS = 90


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _empty() -> ForecastBacktestRead:
    return ForecastBacktestRead(
        coverage_pct=None,
        target_coverage_pct=TARGET_COVERAGE_PCT,
        mae_ewma=None,
        mae_naive=None,
        days_tested=0,
        points=[],
    )


@router.get("/forecast-backtest", response_model=ForecastBacktestRead)
def get_forecast_backtest():
    client = get_client()
    expenses = client.table(EXPENSES).select("amount, entry_date").execute().data

    by_date: dict[date, float] = defaultdict(float)
    for e in expenses:
        d = date.fromisoformat(e["entry_date"])
        by_date[d] += _num(e["amount"])

    if not by_date:
        return _empty()

    first_day = min(by_date)
    today = date.today()
    history_days = (today - first_day).days + 1
    if history_days < MIN_HISTORY_DAYS:
        return _empty()

    daily = [
        by_date.get(first_day + timedelta(days=i), 0.0) for i in range(history_days)
    ]

    results = []
    for t in range(SPAN, history_days):
        actual = daily[t]
        fc = ewma_forecast(daily[:t], horizon=1, span=SPAN, z=Z)
        point = fc["points"][0]
        yhat, lo, hi = point["yhat"], point["lo"], point["hi"]

        window = daily[max(0, t - 7) : t]
        naive = sum(window) / len(window) if window else 0.0
        in_band = lo <= actual <= hi

        results.append(
            {
                "date": first_day + timedelta(days=t),
                "actual": round(actual, 2),
                "yhat": yhat,
                "lo": lo,
                "hi": hi,
                "in_band": in_band,
                "err_ewma": abs(actual - yhat),
                "err_naive": abs(actual - naive),
            }
        )

    days_tested = len(results)
    if days_tested == 0:
        return _empty()

    coverage_pct = round(
        100 * sum(1 for r in results if r["in_band"]) / days_tested, 1
    )
    mae_ewma = round(sum(r["err_ewma"] for r in results) / days_tested, 2)
    mae_naive = round(sum(r["err_naive"] for r in results) / days_tested, 2)

    tail = results[-MAX_POINTS:]
    points = [
        ForecastBacktestPoint(
            date=r["date"],
            actual=r["actual"],
            yhat=r["yhat"],
            lo=r["lo"],
            hi=r["hi"],
            in_band=r["in_band"],
        )
        for r in tail
    ]

    return ForecastBacktestRead(
        coverage_pct=coverage_pct,
        target_coverage_pct=TARGET_COVERAGE_PCT,
        mae_ewma=mae_ewma,
        mae_naive=mae_naive,
        days_tested=days_tested,
        points=points,
    )
