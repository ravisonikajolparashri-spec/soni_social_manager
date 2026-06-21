from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceOut
from app.utils.auth import get_current_user
from app.models.user import User
from app.services.geo_service import get_client_ip, get_country_for_ip

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceOut])
async def list_services(
    request: Request,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    query = select(Service).where(Service.is_active == True)
    if category:
        query = query.where(Service.category == category)
    # Base order is category, name — the country re-sort below is a *stable*
    # sort, so within "my country" and "everything else" this ordering holds.
    query = query.order_by(Service.category, Service.name)
    result = await db.execute(query)
    services = result.scalars().all()

    visitor_country = await get_country_for_ip(get_client_ip(request))
    if visitor_country:
        services = sorted(services, key=lambda s: s.country != visitor_country)

    return services


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Service.category).where(Service.is_active == True).distinct()
    )
    return [r[0] for r in result.all()]


@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Service).where(Service.id == service_id, Service.is_active == True))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
