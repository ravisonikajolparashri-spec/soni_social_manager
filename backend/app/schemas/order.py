from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OrderCreate(BaseModel):
    service_id: int
    link: str
    quantity: int
    comments: Optional[str] = None
    runs: Optional[int] = None
    interval: Optional[int] = None


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
