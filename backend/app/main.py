import os
import asyncio
from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from .db import init_db, get_async_session
from .models import Item, PriceHistory, LatestPriceCache
from .crud import (
    create_item, list_items_with_latest, get_item_or_404,
    get_price_history, refresh_prices_all
)
from .deps import get_current_user_id

load_dotenv()

app = FastAPI(title="Material Price App (MVP)")

@app.on_event("startup")
async def on_startup():
    await init_db()

class ItemIn(BaseModel):
    name: str
    category: Optional[str] = None
    unit: str = "本"             # 表示単位
    base_unit: str = "kg"        # 内部基準単位
    conversion_factor: float = 1 # 表示→基準の換算（例: 1本=3.4kg → 3.4）
    source_key: Optional[str] = None

class ItemOut(BaseModel):
    id: str
    name: str
    category: Optional[str]
    unit: str
    base_unit: str
    conversion_factor: float
    latestPrice: Optional[float] = None
    delta: Optional[float] = None
    deltaRate: Optional[float] = None
    updatedAt: Optional[datetime] = None

class PriceRow(BaseModel):
    priced_at: date
    unit_price: float
    currency: str = "JPY"

@app.get("/health")
async def health():
    return {"ok": True, "time": datetime.now().isoformat()}

@app.get("/items", response_model=List[ItemOut])
async def list_items(user_id: str = Depends(get_current_user_id)):
    return await list_items_with_latest(user_id)

@app.post("/items", response_model=ItemOut)
async def create_item_api(payload: ItemIn, user_id: str = Depends(get_current_user_id)):
    item = await create_item(user_id=user_id, **payload.model_dump())
    return item

@app.get("/items/{item_id}/prices", response_model=List[PriceRow])
async def get_prices(item_id: str, limit: int = 30, user_id: str = Depends(get_current_user_id)):
    # 所有チェック & 履歴返却
    await get_item_or_404(item_id, user_id)
    return await get_price_history(item_id, limit=limit)

@app.post("/refresh")
async def refresh(user_id: str = Depends(get_current_user_id)):
    # デモでは全ユーザー分を更新（実運用は内部認証を別途）
    count = await refresh_prices_all()
    return {"updated": count}
