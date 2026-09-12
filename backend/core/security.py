import base64
import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Header, HTTPException, status

from core.config import get_settings
from core.database import get_client

SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
_ALGORITHM = "HS256"


def _peppered(pin: str) -> bytes:
    raw = (get_settings().pin_pepper + pin).encode("utf-8")
    return base64.b64encode(hashlib.sha256(raw).digest())


def hash_pin(pin: str) -> str:
    return bcrypt.hashpw(_peppered(pin), bcrypt.gensalt()).decode("utf-8")


def verify_pin(pin: str, pin_hash: str) -> bool:
    return bcrypt.checkpw(_peppered(pin), pin_hash.encode("utf-8"))


def get_pin_hash() -> str | None:
    res = get_client().table("app_auth").select("pin_hash").eq("id", 1).execute()
    return res.data[0]["pin_hash"] if res.data else None


def create_session_token() -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "owner",
        "iat": now,
        "exp": now + timedelta(seconds=SESSION_TTL_SECONDS),
    }
    return jwt.encode(payload, get_settings().session_secret, algorithm=_ALGORITHM)


def decode_session_token(token: str) -> bool:
    try:
        jwt.decode(token, get_settings().session_secret, algorithms=[_ALGORITHM])
        return True
    except jwt.PyJWTError:
        return False


def require_auth(
    authorization: str = Header(default=""),
    x_pin: str = Header(default=""),
) -> None:
    if authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if token and decode_session_token(token):
            return
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token i pavlefshëm")

    if x_pin:
        stored = get_pin_hash()
        if not stored:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "PIN nuk është vendosur ende")
        if verify_pin(x_pin, stored):
            return
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "PIN i pasaktë")

    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Mungon autentikimi")
