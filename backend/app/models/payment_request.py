from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from app.database import Base


class PaymentRequest(Base):
    """A user-submitted manual payment (scan-QR-and-pay) awaiting admin review."""

    __tablename__ = "payment_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String, nullable=False, index=True)
    # Base64 data-URL of the payment screenshot the user uploaded (optional)
    screenshot = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="pending", index=True)  # pending, approved, rejected
    admin_note = Column(String, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
