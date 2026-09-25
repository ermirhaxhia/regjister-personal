from pydantic import BaseModel


class Insight(BaseModel):
    id: str
    kind: str
    title: str
    detail: str
    confidence: str
    data_points: int


class InsightsRead(BaseModel):
    insights: list[Insight]
    enough_data: bool


class CorrelationCell(BaseModel):
    row: str
    col: str
    rho: float | None
    n: int
    significant: bool


class CorrelationsRead(BaseModel):
    cells: list[CorrelationCell]
