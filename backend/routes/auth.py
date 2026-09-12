from fastapi import APIRouter, Header, HTTPException, status

from core.database import get_client
from core.security import (
    SESSION_TTL_SECONDS,
    create_session_token,
    get_pin_hash,
    hash_pin,
    require_auth,
    verify_pin,
)
from models.auth import PinSet, PinVerify

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify")
def verify(body: PinVerify):
    stored = get_pin_hash()
    if not stored or not verify_pin(body.pin, stored):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "PIN i pasaktë")
    return {
        "ok": True,
        "token": create_session_token(),
        "expires_in": SESSION_TTL_SECONDS,
    }


@router.post("/pin")
def set_pin(
    body: PinSet,
    authorization: str = Header(default=""),
    x_pin: str = Header(default=""),
):
    client = get_client()
    stored = get_pin_hash()
    if stored:
        require_auth(authorization=authorization, x_pin=x_pin)
        if not body.current_pin or not verify_pin(body.current_pin, stored):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "PIN aktual i pasaktë")
        client.table("app_auth").update({"pin_hash": hash_pin(body.new_pin)}).eq("id", 1).execute()
    else:
        client.table("app_auth").insert({"id": 1, "pin_hash": hash_pin(body.new_pin)}).execute()
    return {"ok": True}
