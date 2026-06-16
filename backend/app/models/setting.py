from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Setting(Base):
    """Generic key/value app settings store (e.g. the payment QR code image)."""

    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
