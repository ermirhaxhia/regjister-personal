from collections import defaultdict
from datetime import date, timedelta

DAY_NAMES = [
    "e hënë",
    "e martë",
    "e mërkurë",
    "e enjte",
    "e premte",
    "e shtunë",
    "e diel",
]
_SHORT_SLEEP_MIN = 360


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _date(v) -> date:
    return date.fromisoformat(v) if isinstance(v, str) else v


def _conf(n: int, med: int, high: int) -> str:
    if n < med:
        return "low"
    if n < high:
        return "medium"
    return "high"


def _spend_by_date(rows: list[dict]) -> dict[date, float]:
    out: dict[date, float] = defaultdict(float)
    for r in rows:
        out[_date(r["entry_date"])] += _num(r["amount"])
    return out


def sleep_spend(sleep_rows: list[dict], expense_rows: list[dict], today: date) -> dict | None:
    """Shpenzimi i të nesërmes sipas gjatësisë së gjumit (nën/mbi 6h)."""
    spend = _spend_by_date(expense_rows)
    dur: dict[date, float] = defaultdict(float)
    for r in sleep_rows:
        dur[_date(r["night_date"])] += _num(r["duration_minutes"])

    short: list[float] = []
    long_: list[float] = []
    for night, minutes in dur.items():
        nxt = night + timedelta(days=1)
        if nxt > today:
            continue
        bucket = short if minutes < _SHORT_SLEEP_MIN else long_
        bucket.append(spend.get(nxt, 0.0))

    if len(short) < 4 or len(long_) < 4:
        return None

    a = sum(short) / len(short)
    b = sum(long_) / len(long_)
    points = len(short) + len(long_)
    pct = round((a - b) / b * 100) if b else 0
    sign = "+" if pct > 0 else ""
    return {
        "id": "sleep_spend",
        "kind": "sleep_spend",
        "title": "Gjumi dhe shpenzimet",
        "detail": (
            f"Pas netëve nën 6h shpenzon mesatarisht {round(a)} L; "
            f"pas netëve mbi 6h {round(b)} L ({sign}{pct}%)."
        ),
        "confidence": _conf(points, 12, 20),
        "data_points": points,
    }


def weekday_spend(expense_rows: list[dict], today: date) -> dict | None:
    """Mesatarja e shpenzimit ditor sipas ditës së javës."""
    spend = _spend_by_date(expense_rows)
    if not spend:
        return None

    first = min(spend)
    total_days = (today - first).days + 1
    if total_days < 14:
        return None

    sums = [0.0] * 7
    counts = [0] * 7
    for i in range(total_days):
        d = first + timedelta(days=i)
        wd = d.weekday()
        sums[wd] += spend.get(d, 0.0)
        counts[wd] += 1

    avgs = {wd: sums[wd] / counts[wd] for wd in range(7) if counts[wd]}
    wd_max = max(avgs, key=avgs.get)
    wd_min = min(avgs, key=avgs.get)
    return {
        "id": "weekday_spend",
        "kind": "weekday_spend",
        "title": "Shpenzimi sipas ditës së javës",
        "detail": (
            f"Të {DAY_NAMES[wd_max]} shpenzon më shumë (mes. {round(avgs[wd_max])} L/ditë), "
            f"të {DAY_NAMES[wd_min]} më pak ({round(avgs[wd_min])} L)."
        ),
        "confidence": _conf(total_days, 28, 56),
        "data_points": total_days,
    }


def payday_window(expense_rows: list[dict], income_rows: list[dict], today: date) -> dict | None:
    """Shpenzimi mesatar në 3 ditët pas pagës kundrejt mesatares së përgjithshme."""
    spend = _spend_by_date(expense_rows)
    if not spend:
        return None

    paydays = sorted({_date(i["received_on"]) for i in income_rows})
    if len(paydays) < 2:
        return None

    first = min(spend)
    history_days = (today - first).days + 1
    if history_days < 21:
        return None

    overall = sum(spend.values()) / history_days
    window: set[date] = set()
    for pd in paydays:
        for k in range(3):
            d = pd + timedelta(days=k)
            if first <= d <= today:
                window.add(d)
    if not window:
        return None

    win_avg = sum(spend.get(d, 0.0) for d in window) / len(window)
    n = len(paydays)
    return {
        "id": "payday_window",
        "kind": "payday_window",
        "title": "Shpenzimi pas pagës",
        "detail": (
            f"Në 3 ditët pas pagës shpenzon mes. {round(win_avg)} L/ditë "
            f"kundrejt {round(overall)} L normalisht."
        ),
        "confidence": _conf(n, 3, 5),
        "data_points": n,
    }


def fitness_habits(
    fitness_rows: list[dict], habit_log_rows: list[dict], habits: list[dict], today: date
) -> dict | None:
    """Raporti i zakoneve të mbajtura në javët me shumë stërvitje kundrejt të tjerave."""
    active = sum(1 for h in habits if h.get("is_active"))
    if active == 0:
        return None

    cur_week = today.isocalendar()[:2]
    fit_days: dict[tuple, set] = defaultdict(set)
    for r in fitness_rows:
        d = _date(r["entry_date"])
        wk = d.isocalendar()[:2]
        if wk != cur_week:
            fit_days[wk].add(d)

    kept: dict[tuple, int] = defaultdict(int)
    for r in habit_log_rows:
        wk = _date(r["entry_date"]).isocalendar()[:2]
        if wk == cur_week:
            continue
        if r.get("done") is True or r.get("duration_minutes") is not None:
            kept[wk] += 1

    weeks = set(fit_days) | set(kept)
    if len(weeks) < 4:
        return None

    denom = active * 7
    high: list[float] = []
    low: list[float] = []
    for wk in weeks:
        ratio = min(1.0, kept.get(wk, 0) / denom)
        if len(fit_days.get(wk, ())) >= 3:
            high.append(ratio)
        else:
            low.append(ratio)
    if not high or not low:
        return None

    p = round(sum(high) / len(high) * 100)
    q = round(sum(low) / len(low) * 100)
    n = len(weeks)
    return {
        "id": "fitness_habits",
        "kind": "fitness_habits",
        "title": "Stërvitja dhe zakonet",
        "detail": (
            f"Javët me ≥3 stërvitje: {p}% zakone të mbajtura "
            f"kundrejt {q}% javët e tjera."
        ),
        "confidence": _conf(n, 6, 10),
        "data_points": n,
    }
