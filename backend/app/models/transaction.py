from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)   # deposit, order_charge, refund, admin_credit
    amount = Column(Float, nullable=False)  # positive = credit, negative = debit
    balance_after = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    reference_id = Column(Integer, nullable=True)  # order_id for charges
    created_at = Column(DateTime(timezone=True), server_default=func.now())
