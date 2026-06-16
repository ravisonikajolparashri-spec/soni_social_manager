import base64
import logging
import time
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.payment_request import PaymentRequest
from app.models.setting import Setting
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.schemas.payment_request import PaymentRequestCreate, PaymentRequestOut, PaymentRequestListOut
from app.utils.auth import get_current_user
from app.utils.rate_limit import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/transactions", tags=["transactions"])

PAYMENT_QR_KEY = "payment_qr_image"

# ── Bundled fallback QR (ships with the code, safe under Railway's ephemeral
# filesystem since it's a static asset re-deployed every release, not a
# runtime upload). Used only until an admin uploads a custom QR via the
# admin panel, at which point the DB-stored Setting always takes priority. ──
_STATIC_QR_PATH = Path(__file__).resolve().parent.parent / "static" / "default_payment_qr.png"
_default_qr_data_url_cache: str | None = None


def _get_default_qr_data_url() -> str | None:
    global _default_qr_data_url_cache
    if _default_qr_data_url_cache is None and _STATIC_QR_PATH.exists():
        encoded = base64.b64encode(_STATIC_QR_PATH.read_bytes()).decode()
        _default_qr_data_url_cache = f"data:image/png;base64,{encoded}"
    return _default_qr_data_url_cache


# ── In-memory cache for the admin-configured QR Setting ─────────────────────
# Avoids a DB round-trip on every Add Funds page load at scale. Invalidated
# immediately whenever the admin updates the QR (see admin.py), and also
# carries a short TTL as a safety net against any other writer.
_qr_cache: dict = {"value": None, "loaded_at": 0.0}
_QR_CACHE_TTL_SECONDS = 300


def invalidate_payment_qr_cache():
    _qr_cache["value"] = None
    _qr_cache["loaded_at"] = 0.0


async def _get_payment_qr_cached(db: AsyncSession) -> str | None:
    now = time.monotonic()
    if _qr_cache["value"] is not None and (now - _qr_cache["loaded_at"]) < _QR_CACHE_TTL_SECONDS:
        return _qr_cache["value"]

    result = await db.execute(select(Setting).where(Setting.key == PAYMENT_QR_KEY))
    setting = result.scalar_one_or_none()
    image = setting.value if setting and setting.value else _get_default_qr_data_url()

    _qr_cache["value"] = image
    _qr_cache["loaded_at"] = now
    return image


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(100)
    )
    return result.scalars().all()


# ── Manual "scan QR & pay" deposits ─────────────────────────────────────────

@router.get("/payment-qr")
async def get_payment_qr(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the QR code image shown on the Add Funds page — the admin-configured
    one if set, otherwise the bundled default. Served from an in-memory cache so
    this hot endpoint doesn't hit Postgres on every page load at scale."""
    image = await _get_payment_qr_cached(db)
    return {"image": image}


@router.post("/payment-requests", response_model=PaymentRequestOut)
@limiter.limit("10/hour")
async def create_payment_request(
    request: Request,
    data: PaymentRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fraud guard: the same UPI transaction/UTR ID must not be submitted twice,
    # whether by the same user retrying or a different user reusing a captured ID.
    dup = await db.execute(
        select(PaymentRequest.id).where(PaymentRequest.transaction_id == data.transaction_id)
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This transaction ID has already been submitted")

    req = PaymentRequest(
        user_id=current_user.id,
        amount=data.amount,
        transaction_id=data.transaction_id,
        screenshot=data.screenshot,
        status="pending",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    logger.info(f"Payment request #{req.id} submitted by user {current_user.id} for ₹{data.amount}")
    return req


@router.get("/payment-requests", response_model=list[PaymentRequestListOut])
async def list_my_payment_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Screenshot blobs are excluded here on purpose — see PaymentRequestListOut.
    result = await db.execute(
        select(PaymentRequest)
        .where(PaymentRequest.user_id == current_user.id)
        .order_by(PaymentRequest.created_at.desc())
        .limit(50)
    )
    rows = result.scalars().all()
    return [
        PaymentRequestListOut(
            id=r.id, user_id=r.user_id, amount=r.amount, transaction_id=r.transaction_id,
            has_screenshot=bool(r.screenshot), status=r.status, admin_note=r.admin_note,
            reviewed_by=r.reviewed_by, created_at=r.created_at, reviewed_at=r.reviewed_at,
        )
        for r in rows
    ]


@router.get("/payment-requests/{request_id}/screenshot")
async def get_my_payment_request_screenshot(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lazy-load a single screenshot — only fetched when the user actually opens it."""
    result = await db.execute(
        select(PaymentRequest).where(
            PaymentRequest.id == request_id, PaymentRequest.user_id == current_user.id
        )
    )
    req = result.scalar_one_or_none()
    if not req or not req.screenshot:
        raise HTTPException(status_code=404, detail="No screenshot found")
    return {"screenshot": req.screenshot}


# ── Admin-only direct fund addition ──────────────────────────────────────────

@router.post("/add-funds", response_model=TransactionOut)
async def add_funds(
    data: AddFundsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Use the Add Funds page to submit a deposit for review.")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if data.amount > 100000:
        raise HTTPException(status_code=400, detail="Maximum deposit is ₹1,00,000")

    current_user.balance = round(current_user.balance + data.amount, 4)
    txn = Transaction(
        user_id=current_user.id,
        type="deposit",
        amount=data.amount,
        balance_after=current_user.balance,
        description=f"Admin credit of ₹{data.amount}",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn
