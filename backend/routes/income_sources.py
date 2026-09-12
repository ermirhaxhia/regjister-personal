from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.income import IncomeSourceCreate, IncomeSourceOut, IncomeSourceUpdate

router = APIRouter(
    prefix="/income-sources",
    tags=["income"],
    dependencies=[Depends(require_auth)],
)

TABLE = "income_sources"
TABLE_INCOME = "income"

_DUPLICATE_MSG = "Ky burim ekziston tashmë"
_NOT_FOUND_MSG = "Burimi nuk u gjet"


def _count_map(client) -> dict[str, int]:
    rows = client.table(TABLE_INCOME).select("source").execute().data
    out: dict[str, int] = {}
    for r in rows:
        name = r.get("source")
        if name:
            out[name] = out.get(name, 0) + 1
    return out


def _raise_db_error(exc: APIError):
    if exc.code == "23505":
        raise HTTPException(status.HTTP_409_CONFLICT, _DUPLICATE_MSG)
    raise HTTPException(
        status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
    )


@router.get("", response_model=list[IncomeSourceOut])
def list_income_sources():
    client = get_client()
    rows = (
        client.table(TABLE)
        .select("*")
        .order("sort_order")
        .order("name")
        .execute()
        .data
    )
    counts = _count_map(client)
    return [{**r, "income_count": counts.get(r["name"], 0)} for r in rows]


@router.post("", response_model=IncomeSourceOut, status_code=status.HTTP_201_CREATED)
def create_income_source(body: IncomeSourceCreate):
    client = get_client()
    orders = [
        r["sort_order"]
        for r in client.table(TABLE).select("sort_order").execute().data
    ]
    next_order = max(orders) + 1 if orders else 0
    payload = {**body.model_dump(mode="json", exclude_none=True), "sort_order": next_order}
    try:
        row = client.table(TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)
    return {**row, "income_count": 0}


@router.patch("/{source_id}", response_model=IncomeSourceOut)
def rename_income_source(source_id: str, body: IncomeSourceUpdate):
    client = get_client()
    current = client.table(TABLE).select("*").eq("id", source_id).execute().data
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    old_name = current[0]["name"]
    new_name = body.name
    row = current[0]
    if new_name != old_name:
        try:
            res = (
                client.table(TABLE)
                .update({"name": new_name})
                .eq("id", source_id)
                .execute()
            )
        except APIError as exc:
            _raise_db_error(exc)
        if not res.data:
            raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
        client.table(TABLE_INCOME).update({"source": new_name}).eq(
            "source", old_name
        ).execute()
        row = res.data[0]
    counts = _count_map(client)
    return {**row, "income_count": counts.get(new_name, 0)}


@router.delete("/{source_id}")
def delete_income_source(source_id: str):
    client = get_client()
    current = client.table(TABLE).select("name").eq("id", source_id).execute().data
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    res = client.table(TABLE).delete().eq("id", source_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    count = _count_map(client).get(current[0]["name"], 0)
    return {"deleted": True, "income_count": count}
