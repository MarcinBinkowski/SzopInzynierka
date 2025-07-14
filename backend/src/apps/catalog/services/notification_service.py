import requests
import logging
from typing import List, Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class SimulatorNotificationService:
    """Service for sending notifications via simulator relay."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        )

    def send_notification(
        self,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send notification to simulator relay."""
        try:
            relay_url = getattr(settings, "SIMULATOR_PUSH_RELAY_URL", None)
            if not relay_url:
                logger.error("SIMULATOR_PUSH_RELAY_URL not configured")
                return {"error": "Simulator relay not configured"}

            payload = {
                "title": title,
                "body": body,
                "data": data or {},
            }

            response = self.session.post(relay_url, json=payload, timeout=5)
            response.raise_for_status()

            logger.info(f"Notification sent to simulator relay: {title}")
            return {"success": True, "relay": True}

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send notification to relay: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error sending notification: {e}")
            return {"error": str(e)}
