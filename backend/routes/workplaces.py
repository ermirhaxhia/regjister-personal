from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.hr import WorkplaceCreate, WorkplaceRead, WorkplaceUpdate

router = APIRouter(
    prefix="/workplaces",
    tags=["hr"],
    dependencies=[Depends(require_auth)],
)

TABLE_WORKPLACES = "sectors"
TABLE_CONTACTS = "colleagues"

_DUPLICATE_MSG = "Ekziston nje vend pune me kete emer"
_NOT_FOUND_MSG = "Vendi i punes nuk u gjet"


def _count_for(client, workplace_id: str) -> int:
    rows = (
        client.table(TABLE_CONTACTS)
        .select("id")
        .eq("sector_id", workplace_id)
        .execute()
        .data
    )
    return len(rows)


def _raise_db_error(exc: APIError):
    if exc.code == "23505":
        raise HTTPException(status.HTTP_409_CONFLICT, _DUPLICATE_MSG)
    raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message or "Kerkese e pavlefshme")


@router.get("", response_model=list[WorkplaceRead])
def list_workplaces():
    client = get_client()
    rows = client.table(TABLE_WORKPLACES).select("*").order("name").execute().data
    contacts = client.table(TABLE_CONTACTS).select("sector_id").execute().data
    counts: dict[str, int] = {}
    for c in contacts:
        sid = c.get("sector_id")
        if sid is not None:
            counts[sid] = counts.get(sid, 0) + 1
    return [{**r, "contact_count": counts.get(r["id"], 0)} for r in rows]


@router.post("", response_model=WorkplaceRead, status_code=status.HTTP_201_CREATED)
def create_workplace(body: WorkplaceCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        row = get_client().table(TABLE_WORKPLACES).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)
    return {**row, "contact_count": 0}


@router.patch("/{workplace_id}", response_model=WorkplaceRead)
def update_workplace(workplace_id: str, body: WorkplaceUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgje per te perditesuar")
    client = get_client()
    try:
        res = (
            client.table(TABLE_WORKPLACES)
            .update(payload)
            .eq("id", workplace_id)
            .execute()
        )
    except APIError as exc:
        _raise_db_error(exc)
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    return {**res.data[0], "contact_count": _count_for(client, workplace_id)}


@router.delete("/{workplace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workplace(workplace_id: str):
    client = get_client()
    try:
        res = (
            client.table(TABLE_WORKPLACES)
            .delete()
            .eq("id", workplace_id)
            .execute()
        )
    except APIError as exc:
        if exc.code == "23503":
            n = _count_for(client, workplace_id)
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Ky vend pune ka {n} kontakte — fshiji ose zhvendosi me pare",
            )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kerkese e pavlefshme"
        )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
