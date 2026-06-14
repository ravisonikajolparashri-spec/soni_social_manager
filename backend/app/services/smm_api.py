import httpx
from typing import Optional
from app.config import settings


class SMMApiError(Exception):
    pass


class SMMApiClient:
    """HTTP client for the configured SMM provider API."""

    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or settings.SMM_API_URL
        self.api_key = api_key or settings.SMM_API_KEY

    async def _post(self, data: dict) -> dict:
        payload = {"key": self.api_key, **data}
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                resp = await client.post(self.api_url, data=payload)
                resp.raise_for_status()
                result = resp.json()
                if isinstance(result, dict) and "error" in result:
                    raise SMMApiError(result["error"])
                return result
            except httpx.HTTPError as e:
                raise SMMApiError(f"HTTP error: {e}")

    async def get_services(self) -> list:
        return await self._post({"action": "services"})

    async def add_order(
        self,
        service_id: int,
        link: str,
        quantity: int,
        comments: Optional[str] = None,
        runs: Optional[int] = None,
        interval: Optional[int] = None,
    ) -> dict:
        """Place an order. Returns {"order": "<order_id>"}"""
        data = {"action": "add", "service": service_id, "link": link, "quantity": quantity}
        if comments:
            data["comments"] = comments
        if runs:
            data["runs"] = runs
        if interval:
            data["interval"] = interval
        return await self._post(data)

    async def get_order_status(self, order_id: int) -> dict:
        """Get status of a single order."""
        return await self._post({"action": "status", "order": order_id})

    async def get_orders_status(self, order_ids: list[int]) -> dict:
        """Get status of multiple orders at once."""
        return await self._post({"action": "status", "orders": ",".join(map(str, order_ids))})

    async def refill_order(self, order_id: int) -> dict:
        """Request a refill for a single order."""
        return await self._post({"action": "refill", "order": order_id})

    async def refill_orders(self, order_ids: list[int]) -> list:
        """Bulk refill multiple orders."""
        return await self._post({"action": "refill", "orders": ",".join(map(str, order_ids))})

    async def get_refill_status(self, refill_id: int) -> dict:
        """Get status of a single refill."""
        return await self._post({"action": "refill_status", "refill": refill_id})

    async def get_bulk_refill_status(self, refill_ids: list[int]) -> list:
        """Get status of multiple refills at once."""
        return await self._post({"action": "refill_status", "refills": ",".join(map(str, refill_ids))})

    async def cancel_order(self, order_id: int) -> dict:
        """Request cancellation of an order."""
        return await self._post({"action": "cancel", "order": order_id})

    async def get_balance(self) -> dict:
        """Get current API wallet balance. Returns {"balance": "...", "currency": "USD"}"""
        return await self._post({"action": "balance"})


smm_client = SMMApiClient()
