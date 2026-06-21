from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    type = Column(String, default="Default")
    rate = Column(Float, nullable=False)           # our selling price per 1000
    original_rate = Column(Float, nullable=False)  # provider cost price per 1000
    min_order = Column(Integer, default=10)
    max_order = Column(Integer, default=10000)
    refill = Column(Boolean, default=False)
    cancel = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    country = Column(String, default="Global", nullable=False, index=True)  # e.g. "India", "USA", "Global"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
