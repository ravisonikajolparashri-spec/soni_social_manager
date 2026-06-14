from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TransactionOut(BaseModel):
    id: int
    user_id: int
    type: str
    amount: float
    balance_after: float
    description: Optional[str]
    reference_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AddFundsRequest(BaseModel):
    amount: float
