import resend
from notifications.config import settings

resend.api_key = settings.RESEND_API_KEY


class ResendEmailClient:
    def __init__(self):
        self.from_address = f"{settings.RESEND_FROM_NAME} <{settings.RESEND_FROM_EMAIL}>"

    def send_email(self, to: list[str], subject: str, html: str) -> bool:
        try:
            params = resend.Emails.SendParams(
                from_=self.from_address,
                to=to,
                subject=subject,
                html=html,
            )
            response = resend.Emails.send(params)
            return bool(response.get("id"))
        except Exception as e:
            print(f"Erreur envoi email: {e}")
            return False


email_client = ResendEmailClient()
