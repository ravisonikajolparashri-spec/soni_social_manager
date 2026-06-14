from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionOut, AddFundsRequest
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(100)
    )
    return result.scalars().all()


# NOTE: Self-service add-funds is intentionally disabled.
# Use Admin → Users → Add Funds, or integrate a payment gateway
# (Stripe/PayPal/crypto) and call the admin endpoint via webhook.
@router.post("/add-funds", response_model=TransactionOut)
async def add_funds(
    data: AddFundsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only admins can call this directly; regular users must go through a payment gateway
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Self-service fund addition is disabled. Please use the payment page or contact support."
        )
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if data.amount > 100000:
        raise HTTPException(status_code=400, detail="Maximum deposit is $100,000")

    current_user.balance = round(current_user.balance + data.amount, 4)
    txn = Transaction(
        user_id=current_user.id,
        type="deposit",
        amount=data.amount,
        balance_after=current_user.balance,
        description=f"Admin self-deposit of ${data.amount}"
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn
