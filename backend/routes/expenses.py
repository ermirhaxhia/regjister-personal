from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from core.database import get_client
from core.security import require_auth
from models.expenses import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
    dependencies=[Depends(require_auth)],
)

TABLE = "expenses"


@router.get("", response_model=list[ExpenseRead])
def list_expenses(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    category: str | None = Query(default=None),
):
    q = get_client().table(TABLE).select("*").order("entry_date", desc=True)
    if date_from:
        q = q.gte("entry_date", date_from.isoformat())
    if date_to:
        q = q.lte("entry_date", date_to.isoformat())
    if category:
        q = q.eq("category", category)
    return q.execute().data


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(body: ExpenseCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    return get_client().table(TABLE).insert(payload).execute().data[0]


@router.get("/{expense_id}", response_model=ExpenseRead)
def get_expense(expense_id: str):
    res = get_client().table(TABLE).select("*").eq("id", expense_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(expense_id: str, body: ExpenseUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = get_client().table(TABLE).update(payload).eq("id", expense_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: str):
    res = get_client().table(TABLE).delete().eq("id", expense_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
