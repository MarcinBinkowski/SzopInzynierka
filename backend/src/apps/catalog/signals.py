import logging
from time import sleep
import uuid
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from decimal import Decimal

from apps.catalog.models.product import Product
from apps.catalog.models.wishlist import WishlistItem
from apps.catalog.models.notification import NotificationPreference, NotificationType
from apps.catalog.tasks import send_wishlist_notification


@receiver(pre_save, sender=Product)
def track_product_changes(sender, instance, **kwargs):
    """Track product changes before saving to detect stock/price changes."""
    if instance.pk:
        try:
            old = Product.objects.get(pk=instance.pk)
            instance._previous_stock = old.stock_quantity
            instance._previous_price = old.price
            instance._previous_is_visible = old.is_visible
        except Product.DoesNotExist:
            instance._previous_stock = None
            instance._previous_price = None
            instance._previous_is_visible = None


@receiver(post_save, sender=Product)
def detect_product_changes(sender, instance, created, **kwargs):
    """Detect product changes and dispatch Celery tasks for notifications."""
    if created:
        return

    previous_stock = getattr(instance, "_previous_stock", None)
    previous_price = getattr(instance, "_previous_price", None)
    previous_is_visible = getattr(instance, "_previous_is_visible", None)
    if previous_stock is None or previous_price is None or previous_is_visible is None:
        return

    stock_became_available = (
        previous_stock == 0 and instance.stock_quantity > 0 and instance.is_visible
    )

    price_dropped = False
    if instance.price < previous_price:
        diff = instance.original_price - instance.price
        if diff >= Decimal("0.01"):
            price_dropped = True

    if not (stock_became_available or price_dropped):
        return

    wishlist_items = WishlistItem.objects.filter(product=instance).select_related(
        "user"
    )
    
    logging.info(f"Product {instance.name} changed - found {wishlist_items.count()} wishlist items")
    notification_uuid = str(uuid.uuid4())
    for wishlist_item in wishlist_items:
        sleep(0.05)
        user = wishlist_item.user
        try:
            pref = NotificationPreference.objects.get(user=user)
        except NotificationPreference.DoesNotExist:
            logging.warning(f"No notification preferences found for user {user.email}")
            continue

        if stock_became_available and pref.stock_alerts_enabled:
            logging.info(f"Queuing stock alert for {user.email} - {instance.name}")
            send_wishlist_notification.delay(
                user_id=user.id,
                product_id=instance.id,
                notification_type=NotificationType.STOCK_AVAILABLE,
                notification_uuid=notification_uuid,
            )

        if price_dropped and pref.price_drop_alerts_enabled:
            logging.info(f"Queuing price drop alert for {user.email} - {instance.name} (was {instance.original_price}, now {instance.price})")
            send_wishlist_notification.delay(
                user_id=user.id,
                product_id=instance.id,
                notification_type=NotificationType.PRICE_DROP,
                previous_price=str(instance.original_price),
                current_price=str(instance.price),
                notification_uuid=notification_uuid,
            )
