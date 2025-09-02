import random
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from .db import get_async_session, AsyncSessionLocal
from .models import Item, PriceHistory, LatestPriceCache

# ---------- Items ----------
async def create_item(user_id: str, name: str, unit: str, base_unit: str,
                      conversion_factor: float, category: Optional[str] = None,
                      source_key: Optional[str] = None):
    async with AsyncSessionLocal() as session:
        # 既存アイテムチェック（ユーザー×名前で一意）
        exists = await session.execute(
            select(Item).where(Item.user_id == user_id, Item.name == name)
        )
        item = exists.scalar_one_or_none()

        if item:
            # 既存アイテムがある場合は属性を更新
            item.unit = unit
            item.base_unit = base_unit
            item.conversion_factor = conversion_factor
            if category is not None:
                item.category = category
            if source_key is not None:
                item.source_key = source_key
            await session.commit()
            await session.refresh(item)
            return await _item_with_latest(session, item)

        # 新規作成
        item = Item(
            user_id=user_id,
            name=name,
            category=category,
            unit=unit,
            base_unit=base_unit,
            conversion_factor=conversion_factor,
            source_key=source_key
        )
        session.add(item)
        await session.commit()
        await session.refresh(item)

        # 初期価格（デモ用にランダム価格を入れる）
        await _upsert_price(session, item.id, date.today(), random.uniform(100, 1000))
        await session.commit()

        return await _item_with_latest(session, item)

async def list_items_with_latest(user_id: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Item).where(Item.user_id == user_id).order_by(Item.created_at.desc()))
        items = result.scalars().all()
        out = []
        for item in items:
            out.append(await _item_with_latest(session, item))
        return out

async def get_item_or_404(item_id: str, user_id: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Item).where(Item.id == item_id, Item.user_id == user_id))
        item = result.scalar_one_or_none()
        if not item:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Item not found")
        return item

async def get_price_history(item_id: str, limit: int = 30):
    async with AsyncSessionLocal() as session:
        q = select(PriceHistory).where(PriceHistory.item_id == item_id).order_by(PriceHistory.priced_at.desc()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [{"priced_at": r.priced_at, "unit_price": float(r.unit_price), "currency": r.currency} for r in rows]

# ---------- Refresh prices (demo) ----------
async def refresh_prices_all() -> int:
    """デモ実装: 各アイテムの価格を ±5% 程度でランダム更新"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Item))
        items = result.scalars().all()

        today = date.today()
        updated = 0
        for item in items:
            # 直近価格を取得
            last_q = select(PriceHistory).where(PriceHistory.item_id == item.id).order_by(PriceHistory.priced_at.desc()).limit(1)
            last = (await session.execute(last_q)).scalar_one_or_none()
            base = float(last.unit_price) if last else 500.0
            new_price = round(base * (1 + random.uniform(-0.05, 0.05)), 2)
            await _upsert_price(session, item.id, today, new_price)
            updated += 1

        await session.commit()
        return updated

# ---------- Helpers ----------
async def _item_with_latest(session: AsyncSession, item: Item):
    cache = await session.get(LatestPriceCache, item.id)
    payload = {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "unit": item.unit,
        "base_unit": item.base_unit,
        "conversion_factor": float(item.conversion_factor),
        "latestPrice": float(cache.unit_price) if cache else None,
        "delta": float(cache.delta) if cache and cache.delta is not None else None,
        "deltaRate": float(cache.delta_rate) if cache and cache.delta_rate is not None else None,
        "updatedAt": cache.updated_at if cache else None,
    }
    return payload

async def _upsert_price(session: AsyncSession, item_id: str, priced_at: date, unit_price: float):
    # 既存の当日価格があれば更新
    q = select(PriceHistory).where(PriceHistory.item_id == item_id, PriceHistory.priced_at == priced_at)
    row = (await session.execute(q)).scalar_one_or_none()
    if row:
        row.unit_price = unit_price
    else:
        session.add(PriceHistory(item_id=item_id, priced_at=priced_at, unit_price=unit_price, currency="JPY"))

    # 前日価格を取得
    prev_q = select(PriceHistory).where(PriceHistory.item_id == item_id, PriceHistory.priced_at < priced_at)\
                                 .order_by(PriceHistory.priced_at.desc()).limit(1)
    prev = (await session.execute(prev_q)).scalar_one_or_none()
    prev_price = float(prev.unit_price) if prev else None

    delta = unit_price - prev_price if prev_price is not None else None
    delta_rate = (delta / prev_price * 100) if prev_price is not None and prev_price != 0 and delta is not None else None

    cache = await session.get(LatestPriceCache, item_id)
    if cache:
        cache.prev_unit_price = prev_price
        cache.unit_price = unit_price
        cache.delta = delta
        cache.delta_rate = delta_rate
    else:
        cache = LatestPriceCache(
            item_id=item_id,
            unit_price=unit_price,
            prev_unit_price=prev_price,
            delta=delta,
            delta_rate=delta_rate
        )
        session.add(cache)
