from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from core.database import get_client
from core.security import require_auth
from models.fitness import (
    UNITS,
    ActivityTypeCreate,
    ActivityTypeRead,
    ActivityTypeUpdate,
)

router = APIRouter(
    prefix="/activity-types",
    tags=["fitness"],
    dependencies=[Depends(require_auth)],
)

TABLE = "activity_types"

_DUPLICATE_MSG = "Ekziston një lloj aktiviteti me këtë emër"
_NOT_FOUND_MSG = "Lloji i aktivitetit nuk u gjet"


def _raise_db_error(exc: APIError):
    if exc.code == "23505":
        raise HTTPException(status.HTTP_409_CONFLICT, _DUPLICATE_MSG)
    if exc.code == "23514":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Kombinim i pavlefshëm units / daily_goal / goal_unit",
        )
    raise HTTPException(
        status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
    )


def _check_goal(row: dict) -> None:
    if row.get("daily_goal") is None:
        return
    unit = row.get("goal_unit")
    if not unit or unit not in (row.get("units") or []):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "goal_unit duhet të jetë një nga units kur ka daily_goal",
        )


@router.get("/units")
def list_units():
    return UNITS


@router.get("", response_model=list[ActivityTypeRead])
def list_activity_types():
    return (
        get_client()
        .table(TABLE)
        .select("*")
        .order("sort_order")
        .order("name")
        .execute()
        .data
    )


@router.post("", response_model=ActivityTypeRead, status_code=status.HTTP_201_CREATED)
def create_activity_type(body: ActivityTypeCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    try:
        return get_client().table(TABLE).insert(payload).execute().data[0]
    except APIError as exc:
        _raise_db_error(exc)


@router.patch("/{type_id}", response_model=ActivityTypeRead)
def update_activity_type(type_id: str, body: ActivityTypeUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    client = get_client()
    current = client.table(TABLE).select("*").eq("id", type_id).execute().data
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    _check_goal({**current[0], **payload})
    try:
        res = client.table(TABLE).update(payload).eq("id", type_id).execute()
    except APIError as exc:
        _raise_db_error(exc)
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
    return res.data[0]


@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity_type(type_id: str):
    client = get_client()
    try:
        res = client.table(TABLE).delete().eq("id", type_id).execute()
    except APIError as exc:
        if exc.code == "23503":
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Ky lloj ka hyrje — fshiji ato më parë",
            )
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, exc.message or "Kërkesë e pavlefshme"
        )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, _NOT_FOUND_MSG)
