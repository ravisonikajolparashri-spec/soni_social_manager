"""
Background job: syncs order statuses from the provider API every 5 minutes
for all pending/in-progress orders.
"""
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.order import Order
from app.services.smm_api import smm_client, SMMApiError
import logging

logger = logging.getLogger(__name__)

ACTIVE_STATUSES = ["Pending", "In progress", "Processing"]


async def sync_order_statuses():
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Order).where(
                    Order.status.in_(ACTIVE_STATUSES),
                    Order.external_order_id.isnot(None)
                ).limit(100)
            )
            orders = result.scalars().all()
            if not orders:
                return

            order_ids = [o.external_order_id for o in orders]
            try:
                statuses = await smm_client.get_orders_status(order_ids)
            except SMMApiError as e:
                logger.error(f"SMM API error during status sync: {e}")
                return

            id_map = {o.external_order_id: o for o in orders}

            for ext_id_str, data in statuses.items():
                ext_id = int(ext_id_str)
                order = id_map.get(ext_id)
                if not order:
                    continue
                if isinstance(data, dict):
                    order.status = data.get("status", order.status)
                    start = data.get("start_count")
                    remains = data.get("remains")
                    if start is not None:
                        order.start_count = int(start)
                    if remains is not None:
                        order.remains = int(remains)

            await db.commit()
            logger.info(f"Synced {len(orders)} orders")
        except Exception as e:
            logger.error(f"Order sync error: {e}")
