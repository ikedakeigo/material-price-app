from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Date, DateTime, Numeric, ForeignKey, UniqueConstraint, func, Text
from .db import Base
import uuid
from datetime import datetime

def gen_uuid() -> str:
    return str(uuid.uuid4())

class Item(Base):
    __tablename__ = "items"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, index=True)  # MVP: ダミー認証
    name: Mapped[str] = mapped_column(String, index=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    unit: Mapped[str] = mapped_column(String)       # 表示単位
    base_unit: Mapped[str] = mapped_column(String)  # 内部基準単位
    conversion_factor: Mapped[float] = mapped_column(Numeric(18,6), default=1)
    source_key: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class PriceHistory(Base):
    __tablename__ = "price_history"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_id: Mapped[str] = mapped_column(String, ForeignKey("items.id"))
    priced_at: Mapped[datetime] = mapped_column(Date)   # JST 日付
    unit_price: Mapped[float] = mapped_column(Numeric(18,4))
    currency: Mapped[str] = mapped_column(String, default="JPY")
    __table_args__ = (UniqueConstraint("item_id", "priced_at", name="uq_price_day"),)

class LatestPriceCache(Base):
    __tablename__ = "latest_price_cache"
    item_id: Mapped[str] = mapped_column(String, ForeignKey("items.id"), primary_key=True)
    unit_price: Mapped[float] = mapped_column(Numeric(18,4))
    currency: Mapped[str] = mapped_column(String, default="JPY")
    prev_unit_price: Mapped[float | None] = mapped_column(Numeric(18,4), nullable=True)
    delta: Mapped[float | None] = mapped_column(Numeric(18,4), nullable=True)
    delta_rate: Mapped[float | None] = mapped_column(Numeric(18,4), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
