from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class PaymentRequestCreate(BaseModel):
    amount: float
    transaction_id: str
    screenshot: Optional[str] = None  # base64 data-URL, e.g. "data:image/png;base64,...."

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v < 1:
            raise ValueError("Minimum deposit is ₹1")
        if v > 500000:
            raise ValueError("Maximum deposit is ₹5,00,000")
        return round(v, 2)

    @field_validator("transaction_id")
    @classmethod
    def validate_transaction_id(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Enter a valid transaction / UTR ID")
        if len(v) > 100:
            raise ValueError("Transaction ID is too long")
        return v

    @field_validator("screenshot")
    @classmethod
    def validate_screenshot(cls, v):
        if v is None:
            return v
        if not v.startswith("data:image/"):
            raise ValueError("Screenshot must be an image")
        # Rough cap (~7MB base64) to avoid abuse
        if len(v) > 7_000_000:
            raise ValueError("Screenshot is too large")
        return v


class PaymentRequestOut(BaseModel):
    id: int
    user_id: int
    amount: float
    transaction_id: str
    screenshot: Optional[str]
    status: str
    admin_note: Optional[str]
    reviewed_by: Optional[int]
    created_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaymentRequestListOut(BaseModel):
    """Lightweight shape for list endpoints — omits the screenshot blob so
    list queries stay fast and small at scale. Use the /screenshot endpoint
    to lazy-load the image only when an admin/owner actually opens it."""
    id: int
    user_id: int
    amount: float
    transaction_id: str
    has_screenshot: bool
    status: str
    admin_note: Optional[str]
    reviewed_by: Optional[int]
    created_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True

    @field_validator("has_screenshot", mode="before")
    @classmethod
    def _coerce_has_screenshot(cls, v):
        return bool(v)


class PaymentRequestAdminOut(PaymentRequestOut):
    username: Optional[str] = None
    email: Optional[str] = None


class PaymentRequestAdminListOut(PaymentRequestListOut):
    username: Optional[str] = None
    email: Optional[str] = None


class PaymentRequestReview(BaseModel):
    admin_note: Optional[str] = None


class PaymentQRUpdate(BaseModel):
    image: str  # base64 data-URL

    @field_validator("image")
    @classmethod
    def validate_image(cls, v):
        if not v.startswith("data:image/"):
            raise ValueError("QR code must be an image")
        if len(v) > 3_000_000:
            raise ValueError("Image is too large")
        return v
