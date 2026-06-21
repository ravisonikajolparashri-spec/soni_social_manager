from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    SMM_API_URL: str = "https://bluesmmpanel.com/api/v2"
    SMM_API_KEY: str

    APP_NAME: str = "Viral SMM Panel"
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # Resend (https://resend.com) — used to send password-reset emails.
    # Leave RESEND_API_KEY empty in dev to have reset links logged instead of emailed.
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Viral SMM Panel <onboarding@resend.dev>"

    # Public URL of the frontend, used to build password-reset links, e.g.
    # "https://myapp.vercel.app". No trailing slash.
    FRONTEND_URL: str = "http://localhost:5173"

    # IP geolocation provider used to sort services by the visitor's country.
    # ip-api.com's free tier needs no key (45 req/min limit); results are cached.
    GEOLOCATION_API_URL: str = "http://ip-api.com/json"

    # Comma-separated list of allowed origins, e.g. "https://myapp.vercel.app,http://localhost:5173"
    # Also accepts "*" to allow all origins (useful for debugging)
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Disable OpenAPI docs in production (set to "false")
    SHOW_DOCS: bool = False

    @property
    def allowed_origins_list(self) -> list[str]:
        # Strip surrounding quotes that Railway/Vercel dashboards sometimes add
        raw = self.ALLOWED_ORIGINS.strip().strip('"').strip("'")
        result = []
        for o in raw.split(","):
            o = o.strip().strip('"').strip("'")
            if o:
                result.append(o)
        return result

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
