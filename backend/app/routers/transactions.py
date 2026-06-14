import hmac
import hashlib
import uuid
import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.utils.auth import get_current_user
from app.config import settings
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/transactions", tags=["transactions"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class RazorpayOrderRequest(BaseModel):
    amount: float  # in INR (e.g. 500.0 = ₹500)


class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int        # paise
    currency: str
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    amount: float      # original INR amount (for crediting balance)


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
    if data.amount < 1:
        raise HTTPException(status_code=400, detail="Minimum deposit is Rs.1")
    if data.amount > 500000:
        raise HTTPException(status_code=400, detail="Maximum deposit is Rs.5,00,000")

    amount_paise = int(round(data.amount * 100))
    receipt = f"rcpt_{uuid.uuid4().hex[:16]}"

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.razorpay.com/v1/orders",
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
                json={"amount": amount_paise, "currency": "INR", "receipt": receipt},
                timeout=15.0,
            )
            resp.raise_for_status()
            order = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"Razorpay order creation failed: {e.response.text}")
        raise HTTPException(status_code=502, detail="Payment gateway error — try again")
    except Exception as e:
        logger.error(f"Razorpay request error: {e}")
        raise HTTPException(status_code=502, detail="Could not reach payment gateway")

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
    if not _verify_razorpay_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    ):
        raise HTTPException(status_code=400, detail="Payment verification failed — invalid signature")

    # Idempotency: reject duplicate payment IDs
    existing = await db.execute(
        select(Transaction).where(
            Transaction.description.contains(data.razorpay_payment_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Payment already processed")

    amount = round(data.amount, 2)
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

    logger.info(f"Payment verified: {data.razorpay_payment_id} — Rs.{amount} credited to user {current_user.id}")
    return txn


# ── Admin-only direct fund addition ──────────────────────────────────────────

@router.post("/add-funds", response_model=TransactionOut)
async def add_funds(
    data: AddFundsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Use the Add Funds page to deposit via Razorpay.",
        )
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if data.amount > 100000:
        raise HTTPException(status_code=400, detail="Maximum deposit is Rs.1,00,000")

    current_user.balance = round(current_user.balance + data.amount, 4)
    txn = Transaction(
        user_id=current_user.id,
        type="deposit",
        amount=data.amount,
        balance_after=current_user.balance,
        description=f"Admin credit of Rs.{data.amount}",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn
