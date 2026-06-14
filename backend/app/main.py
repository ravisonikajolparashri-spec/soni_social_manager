from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models import User, Service, Order, Transaction  # noqa: ensure models are registered
from app.routers import auth, services, orders, transactions, admin
from app.utils.tasks import sync_order_statuses
from app.utils.auth import hash_password
from sqlalchemy import select
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    await init_db()

    # Create default admin user
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                is_admin=True,
                balance=0.0,
            )
            db.add(admin_user)
            await db.commit()
            logger.info(f"Admin user created: {settings.ADMIN_EMAIL}")

    # Start background scheduler
    scheduler.add_job(sync_order_statuses, "interval", minutes=5, id="sync_orders")
    scheduler.start()
    logger.info("Background scheduler started")

    yield

    scheduler.shutdown()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.SHOW_DOCS else None,
    redoc_url="/redoc" if settings.SHOW_DOCS else None,
    openapi_url="/openapi.json" if settings.SHOW_DOCS else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(transactions.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
