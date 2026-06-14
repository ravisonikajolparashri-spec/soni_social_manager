from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models import User, Service, Order, Transaction  # noqa: register models
from app.routers import auth, services, orders, transactions, admin
from app.utils.tasks import sync_order_statuses
from app.utils.auth import hash_password
from app.utils.rate_limit import limiter
from sqlalchemy import select
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


# ── Security headers middleware ───────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"]  = "nosniff"
        response.headers["X-Frame-Options"]         = "DENY"
        response.headers["Referrer-Policy"]         = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"]      = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Remove server identity headers
        response.headers.pop("server", None)
        response.headers.pop("x-powered-by", None)
        return response


# ── DB + admin init ───────────────────────────────────────────────────────────

async def _init_db_with_retry(retries: int = 10, delay: float = 3.0):
    for attempt in range(1, retries + 1):
        try:
            await init_db()
            logger.info("Database tables ready")
            return
        except Exception as e:
            logger.warning(f"DB init attempt {attempt}/{retries} failed: {e}")
            if attempt == retries:
                raise
            await asyncio.sleep(delay)


async def _create_admin_if_missing():
    async with AsyncSessionLocal() as db:
        try:
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
        except Exception as e:
            logger.error(f"Failed to create admin user: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _init_db_with_retry()
    await _create_admin_if_missing()
    scheduler.add_job(sync_order_statuses, "interval", minutes=5, id="sync_orders")
    scheduler.start()
    logger.info("Background scheduler started")
    yield
    scheduler.shutdown()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs"      if settings.SHOW_DOCS else None,
    redoc_url="/redoc"    if settings.SHOW_DOCS else None,
    openapi_url="/openapi.json" if settings.SHOW_DOCS else None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS — only allow our frontend origin(s)
_origins = settings.allowed_origins_list
logger.info(f"CORS allowed origins: {_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["Content-Length"],
    max_age=600,
)

# Routers
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(transactions.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
