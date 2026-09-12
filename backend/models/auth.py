from pydantic import BaseModel, Field

PIN_PATTERN = r"^\d{4,8}$"


class PinVerify(BaseModel):
    pin: str = Field(pattern=PIN_PATTERN)


class PinSet(BaseModel):
    new_pin: str = Field(pattern=PIN_PATTERN)
    current_pin: str | None = None
