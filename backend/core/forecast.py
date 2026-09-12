"""Parashikim afatshkurtër i shpenzimeve me zbutje eksponenciale (EWMA).

Funksione të pastra: pa I/O, pa data — vetëm numra. Datat e pikave i vendos route-i.
"""

from math import sqrt


def ewma_forecast(
    daily: list[float], horizon: int, span: int = 14, z: float = 1.28
) -> dict:
    """Parashiko nivelin ditor të shpenzimeve nga seria e vazhdueshme `daily`.

    `daily` s'ka boshllëqe (ditët pa shpenzim = 0.0). Kthen nivelin e sheshtë
    (EWMA përfundimtar) si parashikim ditor, totalin për `horizon` ditë dhe një
    brez pasigurie nga devijimi standard i mbetjeve një-hap-përpara.
    """
    alpha = 2 / (span + 1)
    level = daily[0]
    resid: list[float] = []
    for value in daily[1:]:
        resid.append(value - level)
        level = alpha * value + (1 - alpha) * level

    sigma = _pop_std(resid)
    margin = z * sigma
    total = level * horizon
    total_margin = z * sigma * sqrt(horizon)

    points = [
        {
            "offset": i,
            "yhat": round(level, 2),
            "lo": round(max(0.0, level - margin), 2),
            "hi": round(level + margin, 2),
        }
        for i in range(1, horizon + 1)
    ]
    return {
        "method": "ewma",
        "daily": round(level, 2),
        "total": round(total, 2),
        "total_lo": round(max(0.0, total - total_margin), 2),
        "total_hi": round(total + total_margin, 2),
        "points": points,
    }


def _pop_std(values: list[float]) -> float:
    """Devijimi standard i popullacionit; 0.0 nëse ka më pak se 2 vlera."""
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    return sqrt(sum((v - mean) ** 2 for v in values) / len(values))
