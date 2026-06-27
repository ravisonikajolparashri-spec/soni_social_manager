import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, cast, Numeric
from typing import Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.models.order import Order
from app.models.transaction import Transaction
from app.models.payment_request import PaymentRequest
from app.models.setting import Setting
from app.schemas.user import UserOut, UserUpdate
from app.schemas.service import ServiceOut, ServiceUpdate, BulkPriceAdjustRequest, BulkPriceAdjustResult
from app.schemas.order import OrderOut
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.schemas.payment_request import (
    PaymentRequestAdminOut, PaymentRequestAdminListOut, PaymentRequestReview, PaymentQRUpdate,
)
from app.schemas.contact_settings import ContactSettings, ContactSettingsUpdate
from app.utils.auth import get_admin_user
from app.utils.country_detect import detect_country
from app.services.smm_api import smm_client, SMMApiError
from app.routers.transactions import invalidate_payment_qr_cache

router = APIRouter(prefix="/api/admin", tags=["admin"])

PAYMENT_QR_KEY = "payment_qr_image"
CONTACT_SETTINGS_KEY = "contact_details"


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
        markup_rate = round(original_rate * 1.7, 4)  # 70% markup

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
            name = svc.get("name", "")
            category = svc.get("category", "General")
            service = Service(
                external_id=ext_id,
                name=name,
                category=category,
                type=svc.get("type", "Default"),
                rate=markup_rate,
                original_rate=original_rate,
                min_order=int(svc.get("min", 10)),
                max_order=int(svc.get("max", 10000)),
                refill=bool(svc.get("refill", False)),
                cancel=bool(svc.get("cancel", False)),
                # Auto-detected once at creation only — never overwritten on
                # later syncs, so an admin's manual country override sticks.
                country=detect_country(name, category),
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


@router.post("/services/detect-countries")
async def detect_service_countries(
    db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)
):
    """
    One-time backfill: scans every service currently tagged "Global" (i.e.
    every service that existed before country tagging was added, or any new
    one the keyword scan didn't catch) and re-runs the name/category keyword
    detector on it. Safe to re-run any time — already-tagged services
    (anything not "Global") are left alone so manual admin overrides stick.
    """
    result = await db.execute(select(Service).where(Service.country == "Global"))
    services = result.scalars().all()

    updated = 0
    for svc in services:
        detected = detect_country(svc.name, svc.category)
        if detected != "Global":
            svc.country = detected
            updated += 1

    await db.commit()
    return {"scanned": len(services), "updated": updated}


@router.post("/services/bulk-price-adjust", response_model=BulkPriceAdjustResult)
async def bulk_price_adjust(
    data: BulkPriceAdjustRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """
    Increase/decrease the selling rate of many services at once by a
    percentage, e.g. percentage=30 raises every matching rate by 30%.
    Runs as a single SQL UPDATE so it's fast even across 1700+ rows.
    """
    if data.scope == "category" and not data.category:
        raise HTTPException(status_code=400, detail="category is required when scope='category'")
    if data.scope == "selected" and not data.service_ids:
        raise HTTPException(status_code=400, detail="service_ids is required when scope='selected'")

    factor = 1 + (data.percentage / 100)

    # Round to 4 decimal places. Postgres' round() needs a numeric type
    # (it doesn't support rounding double precision), hence the cast.
    new_rate_expr = func.round(cast(Service.rate * factor, Numeric(14, 4)), 4)

    stmt = update(Service).values(rate=new_rate_expr)
    if data.scope == "category":
        stmt = stmt.where(Service.category == data.category)
    elif data.scope == "selected":
        stmt = stmt.where(Service.id.in_(data.service_ids))

    result = await db.execute(stmt)
    await db.commit()

    return BulkPriceAdjustResult(updated=result.rowcount, percentage=data.percentage, scope=data.scope)


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


# ── Payment QR settings ──────────────────────────────────────────────────────

@router.get("/settings/payment-qr")
async def admin_get_payment_qr(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    result = await db.execute(select(Setting).where(Setting.key == PAYMENT_QR_KEY))
    setting = result.scalar_one_or_none()
    return {"image": setting.value if setting else None}


@router.put("/settings/payment-qr")
async def admin_set_payment_qr(
    data: PaymentQRUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    result = await db.execute(select(Setting).where(Setting.key == PAYMENT_QR_KEY))
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = data.image
    else:
        setting = Setting(key=PAYMENT_QR_KEY, value=data.image)
        db.add(setting)
    await db.commit()
    invalidate_payment_qr_cache()
    return {"image": data.image}


# ── Contact / social link settings ───────────────────────────────────────────
# Lets an admin change the Instagram / WhatsApp links shown on the public
# Contact page without touching code. Stored as JSON in the generic Setting
# table (same pattern as the payment QR above).

@router.get("/settings/contact-details", response_model=ContactSettings)
async def admin_get_contact_details(db: AsyncSession = Depends(get_db), _: User = Depends(get_admin_user)):
    result = await db.execute(select(Setting).where(Setting.key == CONTACT_SETTINGS_KEY))
    setting = result.scalar_one_or_none()
    if not setting or not setting.value:
        return ContactSettings()
    try:
        return ContactSettings(**json.loads(setting.value))
    except Exception:
        return ContactSettings()


@router.put("/settings/contact-details", response_model=ContactSettings)
async def admin_set_contact_details(
    data: ContactSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    value = json.dumps(data.model_dump())
    result = await db.execute(select(Setting).where(Setting.key == CONTACT_SETTINGS_KEY))
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = value
    else:
        setting = Setting(key=CONTACT_SETTINGS_KEY, value=value)
        db.add(setting)
    await db.commit()
    return ContactSettings(**data.model_dump())


# ── Manual payment requests (scan QR & pay) ──────────────────────────────────

@router.get("/payment-requests", response_model=list[PaymentRequestAdminListOut])
async def admin_list_payment_requests(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    # Screenshot blobs are excluded — use /payment-requests/{id}/screenshot to
    # lazy-load one on demand. limit/offset keep this bounded at scale.
    limit = max(1, min(limit, 200))
    offset = max(0, offset)

    query = (
        select(PaymentRequest, User.username, User.email)
        .join(User, User.id == PaymentRequest.user_id)
        .order_by(PaymentRequest.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status:
        query = query.where(PaymentRequest.status == status)
    result = await db.execute(query)
    rows = result.all()

    out = []
    for req, username, email in rows:
        out.append(PaymentRequestAdminListOut(
            id=req.id, user_id=req.user_id, amount=req.amount, transaction_id=req.transaction_id,
            has_screenshot=bool(req.screenshot), status=req.status, admin_note=req.admin_note,
            reviewed_by=req.reviewed_by, created_at=req.created_at, reviewed_at=req.reviewed_at,
            username=username, email=email,
        ))
    return out


@router.get("/payment-requests/{request_id}/screenshot")
async def admin_get_payment_request_screenshot(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
):
    """Lazy-load a single screenshot for the admin review modal."""
    result = await db.execute(select(PaymentRequest).where(PaymentRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or not req.screenshot:
        raise HTTPException(status_code=404, detail="No screenshot found")
    return {"screenshot": req.screenshot}


@router.post("/payment-requests/{request_id}/approve", response_model=TransactionOut)
async def admin_approve_payment_request(
    request_id: int,
    data: PaymentRequestReview,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # Row-lock both the request and the user for the duration of this transaction
    # so two concurrent approve calls (e.g. an admin double-click, or two admins
    # at once) can never both pass the pending-status check and double-credit
    # the wallet. The second caller blocks here until the first commits, then
    # sees status == "approved" and gets a clean 400 instead of crediting twice.
    result = await db.execute(
        select(PaymentRequest).where(PaymentRequest.id == request_id).with_for_update()
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Payment request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request already {req.status}")

    user_result = await db.execute(
        select(User).where(User.id == req.user_id).with_for_update()
    )
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.balance = round(user.balance + req.amount, 4)
    txn = Transaction(
        user_id=user.id,
        type="deposit",
        amount=req.amount,
        balance_after=user.balance,
        description=f"QR payment approved — txn {req.transaction_id}",
        reference_id=req.id,
    )
    db.add(txn)

    req.status = "approved"
    req.admin_note = data.admin_note
    req.reviewed_by = admin.id
    req.reviewed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(txn)
    return txn


@router.post("/payment-requests/{request_id}/reject", response_model=PaymentRequestAdminOut)
async def admin_reject_payment_request(
    request_id: int,
    data: PaymentRequestReview,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    result = await db.execute(select(PaymentRequest).where(PaymentRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Payment request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request already {req.status}")

    req.status = "rejected"
    req.admin_note = data.admin_note
    req.reviewed_by = admin.id
    req.reviewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(req)

    user_result = await db.execute(select(User).where(User.id == req.user_id))
    user = user_result.scalar_one_or_none()
    out = PaymentRequestAdminOut.model_validate(req)
    out.username = user.username if user else None
    out.email = user.email if user else None
    return out
