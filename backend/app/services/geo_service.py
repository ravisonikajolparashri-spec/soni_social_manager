"""
Resolves a visitor's IP address to a country so the services list can be
sorted to show that country's services first (e.g. Indian visitors see
India-tagged services at the top).

Uses ip-api.com's free tier (no key, ~45 req/min) and caches results in
memory for an hour since a given IP's country essentially never changes
between requests.
"""
import time
import logging
import ipaddress
import httpx
from fastapi import Request
from app.config import settings
from app.utils.country_detect import country_from_code

logger = logging.getLogger(__name__)

_CACHE_TTL_SECONDS = 60 * 60
_cache: dict[str, tuple[str | None, float]] = {}


def get_client_ip(request: Request) -> str:
    """
    Prefer X-Forwarded-For (set by Railway/Vercel/most reverse proxies) since
    request.client.host would otherwise just be the proxy's own address.
    Takes the left-most entry, which is the original client.
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else ""


def _is_public_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
        return not (addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_reserved)
    except ValueError:
        return False


async def get_country_for_ip(ip: str) -> str | None:
    """Returns a canonical country name (e.g. "India") or None if unknown/local."""
    if not ip or not _is_public_ip(ip):
        return None

    cached = _cache.get(ip)
    if cached and cached[1] > time.monotonic():
        return cached[0]

    country = None
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(f"{settings.GEOLOCATION_API_URL}/{ip}", params={"fields": "status,countryCode"})
            data = resp.json()
            if data.get("status") == "success":
                country = country_from_code(data.get("countryCode", ""))
    except Exception as e:
        logger.warning(f"Geolocation lookup failed for {ip}: {e}")

    _cache[ip] = (country, time.monotonic() + _CACHE_TTL_SECONDS)
    return country
