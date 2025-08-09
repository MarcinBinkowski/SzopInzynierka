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
    if instance.pk:  # Only for existing products
        try:
            old = Product.objects.get(pk=instance.pk)
            instance._previous_stock = old.stock_quantity
            instance._previous_price = old.price
            instance._previous_status = old.status
        except Product.DoesNotExist:
            instance._previous_stock = None
            instance._previous_price = None
            instance._previous_status = None


@receiver(post_save, sender=Product)
def detect_product_changes(sender, instance, created, **kwargs):
    """Detect product changes and dispatch Celery tasks for notifications."""
    if created:
        return

    previous_stock = getattr(instance, "_previous_stock", None)
    previous_price = getattr(instance, "_previous_price", None)
    if previous_stock is None or previous_price is None:
        return

    stock_became_available = (
        previous_stock == 0 and instance.stock_quantity > 0 and instance.status == Product.ProductStatus.ACTIVE
    )

    price_dropped = False
    if instance.price < previous_price:
        diff = previous_price - instance.price
        pct = (diff / previous_price) * 100
        if pct >= 5 or diff >= Decimal("1.00"):
            price_dropped = True

    if not (stock_became_available or price_dropped):
        return

    wishlist_items = WishlistItem.objects.filter(product=instance).select_related("user")

    for wishlist_item in wishlist_items:
        user = wishlist_item.user
        pref = NotificationPreference.objects.get(
            user=user
        )
        if not pref.push_token:
            continue

        if stock_became_available and pref.stock_alerts_enabled:
            send_wishlist_notification.delay(
                user_id=user.id,
                product_id=instance.id,
                notification_type=NotificationType.STOCK_AVAILABLE,
            )

        if price_dropped and pref.price_drop_alerts_enabled:
            send_wishlist_notification.delay(
                user_id=user.id,
                product_id=instance.id,
                notification_type=NotificationType.PRICE_DROP,
                previous_price=str(previous_price),
                current_price=str(instance.price),
            )
