import requests
import logging
from typing import List, Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class ExpoNotificationService:
    """Service for sending push notifications via Expo."""
    
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        })
    
    def send_notification(
        self,
        push_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        sound: str = 'default',
        badge: Optional[int] = None,
        priority: str = 'normal'
    ) -> Dict[str, Any]:
        message = {
            'to': push_token,
            'title': title,
            'body': body,
            'sound': sound,
            'priority': priority,
        }
        
        if data:
            message['data'] = data
            
        if badge is not None:
            message['badge'] = badge
        
        try:
            relay_url = getattr(settings, 'SIMULATOR_PUSH_RELAY_URL', None)
            if relay_url:
                payload = {
                    'title': title,
                    'body': body,
                    'data': data or {},
                }
                response = self.session.post(relay_url, json=payload, timeout=5)
                response.raise_for_status()
                logger.info("Notification forwarded to simulator relay")
                return {'relay': True}

            response = self.session.post(
                self.EXPO_PUSH_URL,
                json=message,
                timeout=10
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Notification sent successfully: {result}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send notification: {e}")
            return {'error': str(e)}
    
    def send_batch_notifications(
        self,
        messages: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        try:
            response = self.session.post(
                self.EXPO_PUSH_URL,
                json=messages,
                timeout=30
            )
            response.raise_for_status()
            
            results = response.json()
            logger.info(f"Batch notifications sent: {len(results)} results")
            return results.get('data', [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send batch notifications: {e}")
            return [{'error': str(e)} for _ in messages]


class NotificationProcessor:
    """Legacy queue processor disabled (queue model removed)."""
    def process_pending_notifications(self, limit: int = 100) -> Dict[str, int]:
        return {'processed': 0, 'sent': 0, 'failed': 0, 'cancelled': 0}