from datetime import date, timedelta
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.collections import (
    CollectionCreate,
    CollectionEntryCreate,
    CollectionEntryRead,
    CollectionEntryUpdate,
    CollectionRead,
    CollectionUpdate,
)

router = APIRouter(
    prefix="",
    tags=["collections"],
    dependencies=[Depends(require_auth)],
)

TABLE = "collections"
ENTRIES_TABLE = "collection_entries"


def _habit_or_404(client, habit_id: str) -> dict:
    res = client.table("habits").select("*").eq("id", habit_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Zakoni nuk u gjet")
    return res.data[0]


def _collection_or_404(client, collection_id: str) -> dict:
    res = client.table(TABLE).select("*").eq("id", collection_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Koleksioni nuk u gjet")
    return res.data[0]


def _enrich(client, coll: dict) -> dict:
    entries = (
        client.table(ENTRIES_TABLE)
        .select("entry_date, amount")
        .eq("collection_id", coll["id"])
        .order("entry_date")
        .execute()
        .data
    )
    total_amount = coll["total_amount"]
    amount_total = sum(e["amount"] for e in entries)
    entries_count = len(entries)
    pct_complete = (
        min(100, round(amount_total / total_amount * 100))
        if total_amount is not None
        else None
    )

    amount_per_day = None
    estimated_finish = None
    if entries_count >= 2 and coll["status"] == "active":
        today = date.today()
        first_date = entries[0]["entry_date"]
        if isinstance(first_date, str):
            first_date = date.fromisoformat(first_date)
        days = max((today - first_date).days + 1, 1)
        rate = amount_total / days
        if rate > 0:
            amount_per_day = rate
            if total_amount is not None:
                amount_left = max(total_amount - amount_total, 0)
                if amount_left > 0:
                    estimated_finish = today + timedelta(days=ceil(amount_left / rate))
                else:
                    estimated_finish = today

    return {
        **coll,
        "amount_total": amount_total,
        "pct_complete": pct_complete,
        "entries_count": entries_count,
        "amount_per_day": amount_per_day,
        "estimated_finish": estimated_finish,
    }


def _sync_habit_log(client, habit_id: str, d: date) -> None:
    """Sinkronizon shumën totale të një date të një zakoni koleksion me habit_log."""
    day_str = d.isoformat()
    coll_ids = [
        r["id"]
        for r in client.table(TABLE).select("id").eq("habit_id", habit_id).execute().data
    ]
    total_amount = 0
    if coll_ids:
        total_amount = sum(
            (r.get("amount") or 0)
            for r in client.table(ENTRIES_TABLE)
            .select("amount, entry_date, collection_id")
            .eq("entry_date", day_str)
            .in_("collection_id", coll_ids)
            .execute()
            .data
        )
    existing = (
        client.table("habit_log")
        .select("id")
        .eq("habit_id", habit_id)
        .eq("entry_date", day_str)
        .execute()
        .data
    )
    if total_amount > 0:
        payload = {
            "habit_id": habit_id,
            "entry_date": day_str,
            "duration_minutes": total_amount,
        }
        if existing:
            client.table("habit_log").update(payload).eq("id", existing[0]["id"]).execute()
        else:
            client.table("habit_log").insert(payload).execute()
    elif existing:
        client.table("habit_log").delete().eq("id", existing[0]["id"]).execute()


@router.post(
    "/habits/{habit_id}/collections",
    response_model=CollectionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_collection(habit_id: str, body: CollectionCreate):
    client = get_client()
    habit = _habit_or_404(client, habit_id)
    if habit["tracking_type"] != "koleksion":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Ky zakon s'është i tipit koleksion"
        )
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["habit_id"] = habit_id
    coll = client.table(TABLE).insert(payload).execute().data[0]
    return _enrich(client, coll)


@router.get("/habits/{habit_id}/collections", response_model=list[CollectionRead])
def list_collections(habit_id: str):
    client = get_client()
    _habit_or_404(client, habit_id)
    colls = client.table(TABLE).select("*").eq("habit_id", habit_id).execute().data
    enriched = [_enrich(client, c) for c in colls]
    enriched.sort(key=lambda c: c["updated_at"], reverse=True)
    order = {"active": 0, "paused": 1, "finished": 2}
    enriched.sort(key=lambda c: order[c["status"]])
    return enriched


@router.get("/collections/{collection_id}", response_model=CollectionRead)
def get_collection(collection_id: str):
    client = get_client()
    return _enrich(client, _collection_or_404(client, collection_id))


@router.patch("/collections/{collection_id}", response_model=CollectionRead)
def update_collection(collection_id: str, body: CollectionUpdate):
    client = get_client()
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = client.table(TABLE).update(payload).eq("id", collection_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Koleksioni nuk u gjet")
    return _enrich(client, res.data[0])


@router.delete("/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(collection_id: str):
    client = get_client()
    coll = _collection_or_404(client, collection_id)
    affected_dates = {
        r["entry_date"]
        for r in client.table(ENTRIES_TABLE)
        .select("entry_date")
        .eq("collection_id", collection_id)
        .execute()
        .data
    }
    client.table(TABLE).delete().eq("id", collection_id).execute()
    for day_str in affected_dates:
        d = day_str if isinstance(day_str, date) else date.fromisoformat(day_str)
        _sync_habit_log(client, coll["habit_id"], d)


@router.get("/collections/{collection_id}/entries", response_model=list[CollectionEntryRead])
def list_entries(collection_id: str):
    client = get_client()
    _collection_or_404(client, collection_id)
    return (
        client.table(ENTRIES_TABLE)
        .select("*")
        .eq("collection_id", collection_id)
        .order("entry_date", desc=True)
        .execute()
        .data
    )


@router.post(
    "/collections/{collection_id}/entries",
    response_model=CollectionEntryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_entry(collection_id: str, body: CollectionEntryCreate):
    client = get_client()
    coll = _collection_or_404(client, collection_id)
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["collection_id"] = collection_id
    try:
        entry = client.table(ENTRIES_TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    entry_date = entry["entry_date"]
    if isinstance(entry_date, str):
        entry_date = date.fromisoformat(entry_date)
    _sync_habit_log(client, coll["habit_id"], entry_date)
    return entry


@router.patch(
    "/collections/{collection_id}/entries/{entry_id}", response_model=CollectionEntryRead
)
def update_entry(collection_id: str, entry_id: str, body: CollectionEntryUpdate):
    client = get_client()
    coll = _collection_or_404(client, collection_id)
    existing = (
        client.table(ENTRIES_TABLE).select("*").eq("id", entry_id).execute().data
    )
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hyrja nuk u gjet")
    old_date = existing[0]["entry_date"]
    if isinstance(old_date, str):
        old_date = date.fromisoformat(old_date)

    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = client.table(ENTRIES_TABLE).update(payload).eq("id", entry_id).execute()
    entry = res.data[0]

    new_date = entry["entry_date"]
    if isinstance(new_date, str):
        new_date = date.fromisoformat(new_date)

    _sync_habit_log(client, coll["habit_id"], new_date)
    if new_date != old_date:
        _sync_habit_log(client, coll["habit_id"], old_date)
    return entry


@router.delete(
    "/collections/{collection_id}/entries/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_entry(collection_id: str, entry_id: str):
    client = get_client()
    coll = _collection_or_404(client, collection_id)
    existing = (
        client.table(ENTRIES_TABLE).select("*").eq("id", entry_id).execute().data
    )
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hyrja nuk u gjet")
    entry_date = existing[0]["entry_date"]
    if isinstance(entry_date, str):
        entry_date = date.fromisoformat(entry_date)
    client.table(ENTRIES_TABLE).delete().eq("id", entry_id).execute()
    _sync_habit_log(client, coll["habit_id"], entry_date)
