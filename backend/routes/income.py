from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status

from core.database import get_client
from core.security import require_auth
from models.income import IncomeCreate, IncomeRead, IncomeUpdate

router = APIRouter(
    prefix="/income",
    tags=["income"],
    dependencies=[Depends(require_auth)],
)


def _split(amount: Decimal, kind: str) -> list[dict]:
    if kind == "tjeter":
        return [
            {"bucket": "personale", "amount": str(amount), "percentage": "100.00"},
        ]
    half = (amount / 2).quantize(Decimal("0.01"))
    return [
        {"bucket": "personale", "amount": str(half), "percentage": "50.00"},
        {"bucket": "familje", "amount": str(amount - half), "percentage": "50.00"},
    ]


def _with_allocations(client, row: dict) -> dict:
    allocs = (
        client.table("income_allocations")
        .select("*")
        .eq("income_id", row["id"])
        .execute()
        .data
    )
    return {**row, "allocations": allocs}


def _rebuild_allocations(client, income_id: str, amount: Decimal, kind: str) -> None:
    client.table("income_allocations").delete().eq("income_id", income_id).execute()
    rows = [{**a, "income_id": income_id} for a in _split(amount, kind)]
    client.table("income_allocations").insert(rows).execute()


@router.get("", response_model=list[IncomeRead])
def list_income():
    client = get_client()
    rows = client.table("income").select("*").order("period_month", desc=True).execute().data
    return [_with_allocations(client, r) for r in rows]


@router.post("", response_model=IncomeRead, status_code=status.HTTP_201_CREATED)
def create_income(body: IncomeCreate):
    client = get_client()
    payload = body.model_dump(mode="json", exclude_none=True)
    row = client.table("income").insert(payload).execute().data[0]
    _rebuild_allocations(client, row["id"], body.amount, body.kind)
    return _with_allocations(client, row)


@router.get("/{income_id}", response_model=IncomeRead)
def get_income(income_id: str):
    client = get_client()
    res = client.table("income").select("*").eq("id", income_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return _with_allocations(client, res.data[0])


@router.patch("/{income_id}", response_model=IncomeRead)
def update_income(income_id: str, body: IncomeUpdate):
    client = get_client()
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = client.table("income").update(payload).eq("id", income_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    if body.amount is not None or body.kind is not None:
        updated = res.data[0]
        _rebuild_allocations(
            client, income_id, Decimal(str(updated["amount"])), updated["kind"]
        )
    return _with_allocations(client, res.data[0])


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: str):
    res = get_client().table("income").delete().eq("id", income_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
