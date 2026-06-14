from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ServiceOut(BaseModel):
    id: int
    external_id: int
    name: str
    category: str
    type: str
    rate: float
    min_order: int
    max_order: int
    refill: bool
    cancel: bool
    is_active: bool

    class Config:
        from_attributes = True


class ServiceUpdate(BaseModel):
    rate: Optional[float] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None
