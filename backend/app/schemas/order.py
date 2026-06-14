from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse


class OrderCreate(BaseModel):
    service_id: int
    link: str
    quantity: int
    comments: Optional[str] = None
    runs: Optional[int] = None
    interval: Optional[int] = None

    @field_validator("link")
    @classmethod
    def validate_link(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 2048:
            raise ValueError("Link is too long")
        try:
            parsed = urlparse(v)
            if parsed.scheme not in ("http", "https"):
                raise ValueError("Link must start with http:// or https://")
            if not parsed.netloc:
                raise ValueError("Link must be a valid URL")
        except Exception:
            raise ValueError("Invalid URL format")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be positive")
        if v > 10_000_000:
            raise ValueError("Quantity is unreasonably large")
        return v

    @field_validator("comments")
    @classmethod
    def validate_comments(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 10000:
            raise ValueError("Comments too long")
        return v


class OrderOut(BaseModel):
    id: int
    user_id: int
    service_id: int
    external_order_id: Optional[int]
    link: str
    quantity: int
    charge: float
    start_count: Optional[int]
    remains: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderWithService(OrderOut):
    service_name: Optional[str] = None
    service_category: Optional[str] = None
