"""Matrica e korrelacioneve Spearman me vonesë 1-ditë (t -> t+1) dhe korrigjim BH."""

import math
from collections import defaultdict
from datetime import date, timedelta

from scipy.stats import spearmanr

_MIN_N = 30
_BH_Q = 0.1


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _date(v) -> date:
    return date.fromisoformat(v) if isinstance(v, str) else v


def _sum_by_date(rows: list[dict], date_key: str, value_key: str) -> dict[date, float]:
    out: dict[date, float] = defaultdict(float)
    for r in rows:
        out[_date(r[date_key])] += _num(r[value_key])
    return dict(out)


def _mood_energy(mood_rows: list[dict]) -> tuple[dict[date, float], dict[date, float]]:
    energy: dict[date, float] = {}
    mood: dict[date, float] = {}
    for r in mood_rows:
        d = _date(r["log_date"])
        energy[d] = _num(r["energy"])
        mood[d] = _num(r["mood"])
    return energy, mood


def _habit_rate_by_date(habit_log_rows: list[dict], habits: list[dict]) -> dict[date, float]:
    """Perqindja e zakoneve aktive te permbushura ('met') per cdo dite, si te day.py."""
    active = {h["id"]: h["tracking_type"] for h in habits if h.get("is_active")}
    if not active:
        return {}

    logs_by_date: dict[date, dict[str, dict]] = defaultdict(dict)
    for r in habit_log_rows:
        if r["habit_id"] not in active:
            continue
        logs_by_date[_date(r["entry_date"])][r["habit_id"]] = r

    rate: dict[date, float] = {}
    for d, logs in logs_by_date.items():
        met_count = 0
        for habit_id, tracking_type in active.items():
            log = logs.get(habit_id)
            if not log:
                continue
            if tracking_type == "binary":
                met = log.get("done") is True
            else:
                dur = log.get("duration_minutes")
                met = dur is not None and dur > 0
            if met:
                met_count += 1
        rate[d] = met_count / len(active) * 100
    return rate


def _work_hours_by_date(work_rows: list[dict]) -> dict[date, float]:
    minutes = _sum_by_date(work_rows, "work_date", "duration_minutes")
    return {d: m / 60.0 for d, m in minutes.items()}


def _paired_series(
    col_vals: dict[date, float], row_vals: dict[date, float]
) -> tuple[list[float], list[float]]:
    """Ndërton çifte (x_t, y_t+1) vetëm për ditët ku të dyja ekzistojnë."""
    xs: list[float] = []
    ys: list[float] = []
    for d, x in col_vals.items():
        y = row_vals.get(d + timedelta(days=1))
        if y is None:
            continue
        xs.append(x)
        ys.append(y)
    return xs, ys


def _bh_significant(pvalues: list[float], q: float = _BH_Q) -> list[bool]:
    """Korrigjimi Benjamini-Hochberg standard; kthen flamuj significant në rendin origjinal."""
    m = len(pvalues)
    if m == 0:
        return []

    order = sorted(range(m), key=lambda i: pvalues[i])
    threshold_rank = -1
    for rank, idx in enumerate(order, start=1):
        if pvalues[idx] <= (rank / m) * q:
            threshold_rank = rank

    significant = [False] * m
    if threshold_rank == -1:
        return significant

    cutoff_p = pvalues[order[threshold_rank - 1]]
    for i, p in enumerate(pvalues):
        if p <= cutoff_p:
            significant[i] = True
    return significant


def lagged_correlation_matrix(
    mood_rows: list[dict],
    expense_rows: list[dict],
    habit_log_rows: list[dict],
    habits: list[dict],
    sleep_rows: list[dict],
    work_rows: list[dict],
) -> list[dict]:
    """Ndërton qelizat e matricës korrelacion(t, t+1) me Spearman + korrigjim BH."""
    energy, mood = _mood_energy(mood_rows)
    expense = _sum_by_date(expense_rows, "entry_date", "amount")
    habit_rate = _habit_rate_by_date(habit_log_rows, habits)
    sleep_minutes = _sum_by_date(sleep_rows, "night_date", "duration_minutes")
    work_hours = _work_hours_by_date(work_rows)

    rows = {"energy": energy, "mood": mood, "expense_next": expense, "habit_rate": habit_rate}
    cols = {"sleep": sleep_minutes, "work_hours": work_hours, "expense": expense}

    raw: list[dict] = []
    pvalues: list[float] = []
    for row_name, row_vals in rows.items():
        for col_name, col_vals in cols.items():
            xs, ys = _paired_series(col_vals, row_vals)
            n = len(xs)
            if n < _MIN_N:
                continue
            rho, pvalue = spearmanr(xs, ys)
            rho = float(rho)
            pvalue = float(pvalue)
            if math.isnan(rho) or math.isnan(pvalue):
                continue
            raw.append({"row": row_name, "col": col_name, "rho": rho, "n": n})
            pvalues.append(pvalue)

    flags = _bh_significant(pvalues)
    return [{**cell, "significant": flags[i]} for i, cell in enumerate(raw)]
