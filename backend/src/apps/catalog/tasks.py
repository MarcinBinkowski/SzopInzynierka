from __future__ import annotations

import logging
import uuid
from decimal import Decimal
from celery import shared_task
from django.contrib.auth import get_user_model
from django.conf import settings

from apps.catalog.models.product import Product
from apps.catalog.models.notification import (
    NotificationPreference,
    NotificationHistory,
    NotificationType,
)
from apps.catalog.services.notification_service import SimulatorNotificationService

logger = logging.getLogger(__name__)


@shared_task(name="catalog.send_wishlist_notification")
def send_wishlist_notification(
    user_id: int,
    product_id: int,
    notification_type: str,
    previous_price: str | None = None,
    current_price: str | None = None,
    notification_uuid: str | None = None,
) -> None:
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
        product = Product.objects.get(pk=product_id)
    except (User.DoesNotExist, Product.DoesNotExist):
        return

    relay_url = getattr(settings, "SIMULATOR_PUSH_RELAY_URL", None)
    if not relay_url:
        logger.warning(
            "SIMULATOR_PUSH_RELAY_URL not configured - will create history entry but skip sending"
        )

    try:
        pref = user.notification_preference
    except NotificationPreference.DoesNotExist:
        return

    if (
        notification_type == NotificationType.STOCK_AVAILABLE
        and not pref.stock_alerts_enabled
    ):
        return

    if (
        notification_type == NotificationType.PRICE_DROP
        and not pref.price_drop_alerts_enabled
    ):
        return

    title = "Product Update"
    body = f"Update for {product.name}"

    if notification_type == NotificationType.STOCK_AVAILABLE:
        title = "📦 Back in Stock!"
        body = f"{product.name} is now available. Get it before it's gone!"

    elif notification_type == NotificationType.PRICE_DROP:
        title = "🔥 Price Drop Alert!"
        if previous_price and current_price:
            try:
                new_p = Decimal(current_price)
                savings = Decimal(previous_price) - new_p
                body = f"🔥{product.name} is now ${new_p} (was ${product.original_price}). Save ${savings}!💰💰💰"
            except Exception:
                body = f"{product.name} is now on sale!"
        else:
            body = f"{product.name} is now on sale!"

    
    data = {
        "type": notification_type,
        "product_id": product.id,
        "product_name": product.name,
        "user_id": user.id,
        "notification_uuid": notification_uuid,
    }

    service = SimulatorNotificationService()
    NotificationHistory.objects.create(
        user=user,
        product=product,
        notification_type=notification_type,
        title=title,
        body=body,
    )
    service.send_notification(
        title=title,
        body=body,
        data=data,
    )

    return
