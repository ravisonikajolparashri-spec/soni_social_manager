"""Public, read-only app settings — currently just the contact/social links
shown on the Contact page. No auth required since logged-out visitors land
on /contact too (see LegalLayout's PublicShell).
"""
import json
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.setting import Setting
from app.schemas.contact_settings import ContactSettings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settings", tags=["settings"])

CONTACT_SETTINGS_KEY = "contact_details"


@router.get("/contact-details", response_model=ContactSettings)
async def get_contact_details(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).where(Setting.key == CONTACT_SETTINGS_KEY))
    setting = result.scalar_one_or_none()
    if not setting or not setting.value:
        return ContactSettings()
    try:
        return ContactSettings(**json.loads(setting.value))
    except Exception as e:
        logger.warning(f"Failed to parse contact_details setting, using defaults: {e}")
        return ContactSettings()
