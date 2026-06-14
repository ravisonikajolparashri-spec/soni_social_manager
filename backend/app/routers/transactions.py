import hmac
import hashlib
import uuid
import httpx
import logging
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.utils.auth import get_current_user
from app.config import settings
from pydantic import BaseModel, field_validator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/transactions", tags=["transactions"])

# ── Server-side pending payment store ─────────────────────────────────────────
# Maps razorpay_order_id → (user_id, amount_inr, expires_at)
# This prevents the client from manipulating the amount credited to their wallet.
# Entries expire after 1 hour automatically.
_pending_payments: dict[str, tuple[int, float, float]] = {}
_PAYMENT_TTL = 3600  # 1 hour


def _store_pending(order_id: str, user_id: int, amount: float) -> None:
    # Prune expired entries to avoid unbounded growth
    now = time.time()
    expired = [k for k, v in _pending_payments.items() if v[2] < now]
    for k in expired:
        del _pending_payments[k]
    _pending_payments[order_id] = (user_id, amount, now + _PAYMENT_TTL)


def _consume_pending(order_id: str, user_id: int) -> float:
    """Return the server-stored amount and remove the entry. Raises if invalid."""
    entry = _pending_payments.pop(order_id, None)
    if entry is None:
        raise HTTPException(status_code=400, detail="Payment session expired or not found. Please retry.")
    stored_user_id, amount, expires_at = entry
    if time.time() > expires_at:
        raise HTTPException(status_code=400, detail="Payment session expired. Please retry.")
    if stored_user_id != user_id:
        logger.warning(f"User ID mismatch on payment verify: stored={stored_user_id}, got={user_id}")
        raise HTTPException(status_code=403, detail="Payment session mismatch.")
    return amount


# ── Schemas ───────────────────────────────────────────────────────────────────

class RazorpayOrderRequest(BaseModel):
    amount: float  # INR

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v < 1:
            raise ValueError("Minimum deposit is ₹1")
        if v > 500000:
            raise ValueError("Maximum deposit is ₹5,00,000")
        return round(v, 2)


class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int        # paise
    currency: str
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    # NOTE: amount is intentionally NOT accepted from client anymore.
    # The amount is looked up from server-side store keyed by razorpay_order_id.


# ── Helpers ───────────────────────────────────────────────────────────────────

def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


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


@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    data: RazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    amount_paise = int(round(data.amount * 100))
    receipt = f"rcpt_{uuid.uuid4().hex[:16]}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.razorpay.com/v1/orders",
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
                json={"amount": amount_paise, "currency": "INR", "receipt": receipt},
            )
            resp.raise_for_status()
            order = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"Razorpay order creation failed: {e.response.text}")
        raise HTTPException(status_code=502, detail="Payment gateway error — try again")
    except Exception as e:
        logger.error(f"Razorpay request error: {e}")
        raise HTTPException(status_code=502, detail="Could not reach payment gateway")

    # Store the authoritative amount server-side — client cannot alter this
    _store_pending(order["id"], current_user.id, data.amount)
    logger.info(f"Razorpay order created: {order['id']} for user {current_user.id}, ₹{data.amount}")

    return RazorpayOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
    )


@router.post("/verify-payment", response_model=TransactionOut)
async def verify_payment(
    data: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify Razorpay HMAC signature
    if not _verify_razorpay_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    ):
        logger.warning(f"Invalid Razorpay signature for order {data.razorpay_order_id} by user {current_user.id}")
        raise HTTPException(status_code=400, detail="Payment verification failed — invalid signature")

    # 2. Retrieve server-stored amount (prevents client manipulation)
    amount = _consume_pending(data.razorpay_order_id, current_user.id)

    # 3. Idempotency — reject duplicate payment IDs
    existing = await db.execute(
        select(Transaction).where(
            Transaction.description.contains(data.razorpay_payment_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Payment already processed")

    # 4. Credit balance
    current_user.balance = round(current_user.balance + amount, 4)
    txn = Transaction(
        user_id=current_user.id,
        type="deposit",
        amount=amount,
        balance_after=current_user.balance,
        description=f"Razorpay {data.razorpay_payment_id}",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    logger.info(f"Payment verified: {data.razorpay_payment_id} — ₹{amount} credited to user {current_user.id}")
    return txn


# ── Admin-only direct fund addition ──────────────────────────────────────────

@router.post("/add-funds", response_model=TransactionOut)
async def add_funds(
    data: AddFundsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Use the Add Funds page to deposit via Razorpay.")
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
