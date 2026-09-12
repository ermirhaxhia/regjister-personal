from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.expenses import (
    ExpenseCategoryCreate,
    ExpenseCategoryOut,
    ExpenseCategoryUpdate,
)

router = APIRouter(
    prefix="/expense-categories",
    tags=["expenses"],
    dependencies=[Depends(require_auth)],
)

TABLE = "expense_categories"
TABLE_EXPENSES = "expenses"

_DUPLICATE_MSG = "Kjo kategori ekziston tashmë"
_NOT_FOUND_MSG = "Kategoria nuk u gjet"


def _count_map(client) -> dict[str, int]:
    rows = client.table(TABLE_EXPENSES).select("category").execute().data
    out: dict[str, int] = {}
    for r in rows:
        name = r.get("category")
        if name:
            out[name] = out.get(name, 0) + 1
    return out


def _raise_db_error(exc: APIError):
    if exc.code == "23505":
        raise HTTPException(status.HTTP_409_CONFLICT, _DUPLICATE_MSG)
    raise HTTPException(
        status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
    )


@router.get("", response_model=list[ExpenseCategoryOut])
def list_expense_categories():
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
    return [{**r, "expense_count": counts.get(r["name"], 0)} for r in rows]


@router.post(
    "", response_model=ExpenseCategoryOut, status_code=status.HTTP_201_CREATED
)
def create_expense_category(body: ExpenseCategoryCreate):
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
    return {**row, "expense_count": 0}


@router.patch("/{category_id}", response_model=ExpenseCategoryOut)
def rename_expense_category(category_id: str, body: ExpenseCategoryUpdate):
    client = get_client()
    current = client.table(TABLE).select("*").eq("id", category_id).execute().data
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
                .eq("id", category_id)
                .execute()
            )
        except APIError as exc:
            _raise_db_error(exc)
        if not res.data:
            raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
        client.table(TABLE_EXPENSES).update({"category": new_name}).eq(
            "category", old_name
        ).execute()
        row = res.data[0]
    counts = _count_map(client)
    return {**row, "expense_count": counts.get(new_name, 0)}


@router.delete("/{category_id}")
def delete_expense_category(category_id: str):
    client = get_client()
    current = (
        client.table(TABLE).select("name").eq("id", category_id).execute().data
    )
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    res = client.table(TABLE).delete().eq("id", category_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    count = _count_map(client).get(current[0]["name"], 0)
    return {"deleted": True, "expense_count": count}
