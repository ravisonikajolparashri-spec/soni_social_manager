from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.models.order import Order
from app.models.transaction import Transaction
from app.schemas.order import OrderCreate, OrderOut, OrderWithService
from app.utils.auth import get_current_user
from app.services.smm_api import smm_client, SMMApiError

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
async def place_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get service
    result = await db.execute(select(Service).where(Service.id == data.service_id, Service.is_active == True))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Validate quantity
    if data.quantity < service.min_order or data.quantity > service.max_order:
        raise HTTPException(
            status_code=400,
            detail=f"Quantity must be between {service.min_order} and {service.max_order}"
        )

    # Calculate charge
    charge = round((service.rate / 1000) * data.quantity, 4)

    # Check balance
    if current_user.balance < charge:
        raise HTTPException(status_code=402, detail=f"Insufficient balance. Required: ${charge:.4f}")

    # Place order on EasySMM
    try:
        smm_response = await smm_client.add_order(
            service_id=service.external_id,
            link=data.link,
            quantity=data.quantity,
            comments=data.comments,
            runs=data.runs,
            interval=data.interval
        )
    except SMMApiError as e:
        raise HTTPException(status_code=502, detail=f"SMM API error: {str(e)}")

    external_order_id = smm_response.get("order")

    # Deduct balance
    current_user.balance = round(current_user.balance - charge, 4)

    # Create order
    order = Order(
        user_id=current_user.id,
        service_id=service.id,
        external_order_id=external_order_id,
        link=data.link,
        quantity=data.quantity,
        charge=charge,
        status="Pending"
    )
    db.add(order)

    # Create transaction
    txn = Transaction(
        user_id=current_user.id,
        type="order_charge",
        amount=-charge,
        balance_after=current_user.balance,
        description=f"Order for {service.name}",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(order)

    # Link transaction to order
    txn.reference_id = order.id
    await db.commit()

    return order


@router.get("", response_model=list[OrderOut])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/refill")
async def refill_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not order.external_order_id:
        raise HTTPException(status_code=400, detail="Order has no external ID")

    try:
        resp = await smm_client.refill_order(order.external_order_id)
        return {"success": True, "refill": resp}
    except SMMApiError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not order.external_order_id:
        raise HTTPException(status_code=400, detail="Order has no external ID")

    try:
        resp = await smm_client.cancel_order(order.external_order_id)
        order.status = "Canceled"
        await db.commit()
        return {"success": True, "result": resp}
    except SMMApiError as e:
        raise HTTPException(status_code=502, detail=str(e))
