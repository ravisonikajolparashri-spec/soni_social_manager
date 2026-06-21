from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import os

# Railway (and most providers) give postgresql:// — asyncpg needs postgresql+asyncpg://
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Railway Postgres requires SSL. Add ?ssl=require if not already in the URL.
# Skip SSL only when explicitly disabled (local dev without SSL).
_require_ssl = os.getenv("DB_SSL", "true").lower() != "false"
if _require_ssl and "ssl=" not in _db_url and "sslmode=" not in _db_url:
    _db_url += ("&" if "?" in _db_url else "?") + "ssl=require"

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,       # test connection before use — detects stale connections
    pool_recycle=300,          # recycle connections every 5 min
    pool_size=5,
    max_overflow=10,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _run_lightweight_migrations(conn)


async def _run_lightweight_migrations(conn):
    """
    This project uses Base.metadata.create_all() instead of Alembic, which only
    creates brand-new tables — it never adds columns to a table that already
    exists in production. Any column added to a model after the table has been
    created in a live DB needs an explicit ALTER TABLE here (Postgres-only,
    using IF NOT EXISTS so this is safe to run on every startup).
    """
    from sqlalchemy import text

    statements = [
        "ALTER TABLE services ADD COLUMN IF NOT EXISTS country VARCHAR DEFAULT 'Global' NOT NULL",
        "CREATE INDEX IF NOT EXISTS ix_services_country ON services (country)",
    ]
    for stmt in statements:
        try:
            await conn.execute(text(stmt))
        except Exception:
            # Non-Postgres backend or column already managed some other way — skip.
            pass
