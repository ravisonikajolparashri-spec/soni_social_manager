"""
Transactional email sending via Resend (https://resend.com).

If RESEND_API_KEY is not configured (e.g. local dev), emails are logged
instead of sent so the reset flow is still testable end-to-end without an
account.
"""
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.warning(
            f"RESEND_API_KEY not set — skipping real send. Would have emailed "
            f"{to!r} subject={subject!r}:\n{html}"
        )
        return

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        if resp.status_code >= 400:
            logger.error(f"Resend send failed ({resp.status_code}): {resp.text}")
            # Don't raise — a failed email shouldn't reveal account existence
            # or break the request/response timing of the forgot-password flow.


async def send_password_reset_email(to: str, reset_link: str) -> None:
    subject = f"Reset your {settings.APP_NAME} password"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#111;">Reset your password</h2>
      <p style="color:#333; font-size:15px;">
        We received a request to reset the password for your {settings.APP_NAME} account.
        Click the button below to choose a new password. This link expires in 30 minutes.
      </p>
      <p style="margin: 28px 0;">
        <a href="{reset_link}"
           style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:10px;
                  text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color:#888; font-size:13px;">
        If you didn't request this, you can safely ignore this email — your password will not be changed.
      </p>
      <p style="color:#888; font-size:12px;">
        Or paste this link into your browser:<br>{reset_link}
      </p>
    </div>
    """
    await send_email(to, subject, html)
