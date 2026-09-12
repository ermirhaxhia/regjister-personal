from fastapi import APIRouter, Depends, HTTPException, status

from core.database import get_client
from core.security import require_auth
from models.sleep import SleepCreate, SleepRead, SleepUpdate

router = APIRouter(
    prefix="/sleep",
    tags=["sleep"],
    dependencies=[Depends(require_auth)],
)

TABLE = "sleep_log"


@router.get("", response_model=list[SleepRead])
def list_sleep():
    return get_client().table(TABLE).select("*").order("night_date", desc=True).execute().data


@router.post("", response_model=SleepRead, status_code=status.HTTP_201_CREATED)
def create_sleep(body: SleepCreate):
    payload = body.model_dump(mode="json", exclude_none=True)
    payload["night_date"] = (body.night_date or body.sleep_start.date()).isoformat()
    return get_client().table(TABLE).insert(payload).execute().data[0]


@router.get("/{sleep_id}", response_model=SleepRead)
def get_sleep(sleep_id: str):
    res = get_client().table(TABLE).select("*").eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.patch("/{sleep_id}", response_model=SleepRead)
def update_sleep(sleep_id: str, body: SleepUpdate):
    payload = body.model_dump(mode="json", exclude_unset=True)
    if not payload:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Asgjë për të përditësuar")
    res = get_client().table(TABLE).update(payload).eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
    return res.data[0]


@router.delete("/{sleep_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sleep(sleep_id: str):
    res = get_client().table(TABLE).delete().eq("id", sleep_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Nuk u gjet")
