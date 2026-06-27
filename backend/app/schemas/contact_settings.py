from pydantic import BaseModel


class ContactSettings(BaseModel):
    """Public-facing contact / social links shown on the Contact page.

    Defaults match what used to be hardcoded in the frontend, so nothing
    changes for visitors until an admin actually edits these in the admin
    panel.
    """
    instagram_url: str = "https://www.instagram.com/viralsmmpanel_?igsh=MWhhNHF0eGpmOTd6cg=="
    instagram_label: str = "@viralsmmpanel_"
    whatsapp_number: str = "+91 94102 75555"
    support_email: str = ""


class ContactSettingsUpdate(BaseModel):
    instagram_url: str
    instagram_label: str
    whatsapp_number: str
    support_email: str = ""
