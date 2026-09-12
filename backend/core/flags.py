from datetime import date, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.summary import BudgetBlock

_WARN = "warn"
_INFO = "info"
_MAX_FLAGS = 5
_SHORT_SLEEP_MIN = 360


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _int(v) -> int:
    return int(round(_num(v)))


def _spend_pace(budget: "BudgetBlock") -> dict | None:
    if budget.daily_allowed <= 0 or budget.daily_rate <= budget.daily_allowed * 1.3:
        return None
    pct = round(budget.daily_rate / budget.daily_allowed * 100 - 100)
    return {
        "id": "spend_pace",
        "severity": _WARN,
        "module": "expenses",
        "text": (
            f"Ritmi i shpenzimit është {pct}% mbi buxhetin ditor "
            f"({_int(budget.daily_rate)} L/ditë kundrejt {_int(budget.daily_allowed)} L)."
        ),
    }


def _payday_negative(budget: "BudgetBlock") -> dict | None:
    if budget.projected_at_payday >= 0:
        return None
    return {
        "id": "payday_negative",
        "severity": _WARN,
        "module": "expenses",
        "text": (
            f"Me këtë ritëm, te paga tjetër del ~{abs(_int(budget.projected_at_payday))} L minus."
        ),
    }


def _week_spike(spending: dict[str, float]) -> dict | None:
    prev = _num(spending.get("week_previous"))
    cur = _num(spending.get("week_current"))
    if prev <= 0 or cur <= prev * 1.5:
        return None
    pct = round(cur / prev * 100 - 100)
    return {
        "id": "week_spike",
        "severity": _WARN,
        "module": "expenses",
        "text": f"Këtë javë ke shpenzuar {pct}% më shumë se javën e kaluar.",
    }


def _sleep_short_streak(today: date, sleep_rows: list[dict]) -> dict | None:
    dur: dict[date, float] = {}
    for r in sleep_rows:
        nd = date.fromisoformat(r["night_date"])
        dur[nd] = dur.get(nd, 0.0) + _num(r["duration_minutes"])
    if not dur:
        return None
    cursor = today if today in dur else today - timedelta(days=1)
    n = 0
    while cursor in dur and dur[cursor] < _SHORT_SLEEP_MIN:
        n += 1
        cursor -= timedelta(days=1)
    if n < 3:
        return None
    return {
        "id": "sleep_short_streak",
        "severity": _WARN,
        "module": "sleep",
        "text": f"{n} net radhazi nën 6 orë gjumë.",
    }


def _no_expense_recent(today: date, by_date: dict[date, float]) -> dict | None:
    if not by_date:
        return None
    gap = (today - max(by_date)).days
    if gap < 3:
        return None
    return {
        "id": "no_expense_recent",
        "severity": _INFO,
        "module": "expenses",
        "text": f"S'ke shënuar shpenzim prej {gap} ditësh.",
    }


def _habit_silent(
    today: date, habit_log_rows: list[dict], habits: list[dict]
) -> list[dict]:
    logs: dict[str, list[date]] = {}
    for r in habit_log_rows:
        logs.setdefault(r["habit_id"], []).append(date.fromisoformat(r["entry_date"]))
    recent_cutoff = today - timedelta(days=3)
    out: list[dict] = []
    for h in habits:
        if not h.get("is_active"):
            continue
        dates = logs.get(h["id"])
        if not dates or any(d >= recent_cutoff for d in dates):
            continue
        out.append(
            {
                "id": f"habit_silent:{h['id']}",
                "severity": _INFO,
                "module": "habits",
                "text": f"Zakoni «{h['name']}» pa shënim prej 4 ditësh.",
            }
        )
        if len(out) == 2:
            break
    return out


def _on_track(budget: "BudgetBlock", has_warn: bool) -> dict | None:
    if has_warn or budget.daily_allowed <= 0:
        return None
    if budget.projected_at_payday < budget.daily_allowed * 3:
        return None
    return {
        "id": "on_track",
        "severity": _INFO,
        "module": "general",
        "text": f"Ecën mirë — parashikimi te paga +{_int(budget.projected_at_payday)} L.",
    }


def build_flags(
    *,
    today: date,
    by_date: dict[date, float],
    budget: "BudgetBlock | None",
    spending: dict[str, float],
    sleep_rows: list[dict],
    habit_log_rows: list[dict],
    habits: list[dict],
) -> list[dict]:
    flags: list[dict] = []

    if budget is not None:
        for fn in (_spend_pace, _payday_negative):
            f = fn(budget)
            if f:
                flags.append(f)

    for f in (
        _week_spike(spending),
        _sleep_short_streak(today, sleep_rows),
        _no_expense_recent(today, by_date),
    ):
        if f:
            flags.append(f)

    flags.extend(_habit_silent(today, habit_log_rows, habits))

    if budget is not None:
        has_warn = any(f["severity"] == _WARN for f in flags)
        f = _on_track(budget, has_warn)
        if f:
            flags.append(f)

    flags.sort(key=lambda x: 0 if x["severity"] == _WARN else 1)
    return flags[:_MAX_FLAGS]
