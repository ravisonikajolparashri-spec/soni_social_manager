from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    external_order_id = Column(Integer, nullable=True, index=True)  # EasySMM order ID
    link = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    charge = Column(Float, nullable=False)        # amount deducted from balance
    start_count = Column(Integer, nullable=True)
    remains = Column(Integer, nullable=True)
    status = Column(String, default="Pending")    # Pending, In progress, Completed, Partial, Canceled, Processing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
