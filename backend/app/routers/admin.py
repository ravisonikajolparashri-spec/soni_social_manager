from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.models.order import Order
from app.models.transaction import Transaction
from app.schemas.user import UserOut, UserUpdate
from app.schemas.service import ServiceOut, ServiceUpdate
from app.schemas.order import OrderOut
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.utils.auth import get_admin_user
from app.services.smm_api import smm_client, SMMApiError

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()
    total_revenue = (await db.execute(select(func.sum(Order.charge)))).scalar() or 0
    active_services = (await db.execute(select(func.count(Service.id)).where(Service.is_active == True))).scalar()
    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status.in_(["Pending", "In progress", "Processing"]))
    )).scalar()

    try:
        balance_data = await smm_client.get_balance()
        api_balance = balance_data.get("balance", "N/A")
    except Exception:
        api_balance = "N/A"

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "active_services": active_services,
        "pending_orders": pending_orders,
        "api_balance": api_balance,
    }


# ── Users ────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/users/{user_id}/add-funds", response_model=TransactionOut)
async def admin_add_funds(
    user_id: int,
    data: AddFundsRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.balance = round(user.balance + data.amount, 4)
    txn = Transaction(
        user_id=user.id,
        type="admin_credit",
        amount=data.amount,
        balance_after=user.balance,
        description=f"Admin credit by {admin.email}"
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn


# ── Services ─────────────────────────────────────────────────────────────────

@router.post("/services/sync")
async def sync_services(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    try:
        raw_services = await smm_client.get_services()
    except SMMApiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    added, updated = 0, 0
    for svc in raw_services:
        ext_id = int(svc.get("service") or svc.get("id", 0))
        result = await db.execute(select(Service).where(Service.external_id == ext_id))
        existing = result.scalar_one_or_none()

        original_rate = float(svc.get("rate", 0))
        markup_rate = round(original_rate * 1.3, 4)  # 30% default markup

        if existing:
            existing.name = svc.get("name", existing.name)
            existing.category = svc.get("category", existing.category)
            existing.original_rate = original_rate
            existing.min_order = int(svc.get("min", existing.min_order))
            existing.max_order = int(svc.get("max", existing.max_order))
            existing.refill = bool(svc.get("refill", False))
            existing.cancel = bool(svc.get("cancel", False))
            updated += 1
        else:
            service = Service(
                external_id=ext_id,
                name=svc.get("name", ""),
                category=svc.get("category", "General"),
                type=svc.get("type", "Default"),
                rate=markup_rate,
                original_rate=original_rate,
                min_order=int(svc.get("min", 10)),
                max_order=int(svc.get("max", 10000)),
                refill=bool(svc.get("refill", False)),
                cancel=bool(svc.get("cancel", False)),
            )
            db.add(service)
            added += 1

    await db.commit()
    return {"added": added, "updated": updated}


@router.get("/services", response_model=list[ServiceOut])
async def admin_list_services(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    result = await db.execute(select(Service).order_by(Service.category, Service.name))
    return result.scalars().all()


@router.patch("/services/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return service


# ── Orders ───────────────────────────────────────────────────────────────────

@router.get("/orders", response_model=list[OrderOut])
async def admin_list_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    query = select(Order).order_by(Order.created_at.desc())
    if status:
        query = query.where(Order.status == status)
    result = await db.execute(query)
    return result.scalars().all()
