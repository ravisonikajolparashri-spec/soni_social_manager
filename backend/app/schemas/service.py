from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class ServiceOut(BaseModel):
    id: int
    external_id: int
    name: str
    category: str
    type: str
    rate: float
    original_rate: float
    min_order: int
    max_order: int
    refill: bool
    cancel: bool
    is_active: bool
    country: str

    class Config:
        from_attributes = True


class ServiceUpdate(BaseModel):
    rate: Optional[float] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None
    country: Optional[str] = None


class BulkPriceAdjustRequest(BaseModel):
    """
    Adjust the selling `rate` of many services at once by a percentage.
    percentage=30 -> +30% (rate * 1.30). percentage=-10 -> -10% (rate * 0.90).

    scope="all"      -> every service
    scope="category" -> every service in `category`
    scope="selected" -> only the services in `service_ids`
    """
    percentage: float = Field(..., gt=-100, le=1000)
    scope: Literal["all", "category", "selected"] = "all"
    category: Optional[str] = None
    service_ids: Optional[list[int]] = None


class BulkPriceAdjustResult(BaseModel):
    updated: int
    percentage: float
    scope: str
