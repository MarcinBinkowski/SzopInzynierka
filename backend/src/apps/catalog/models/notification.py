from django.db import models
from django.conf import settings
from apps.common.models import TimestampedModel
from apps.catalog.models.product import Product


class NotificationPreference(TimestampedModel):
    """Model for user notification preferences."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preference",
        help_text="User who owns these preferences",
    )

    stock_alerts_enabled = models.BooleanField(
        default=False,
        help_text="Receive alerts when out-of-stock wishlist items become available",
    )
    price_drop_alerts_enabled = models.BooleanField(
        default=False, help_text="Receive alerts when wishlist items go on sale"
    )

    class Meta:
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"

    def __str__(self) -> str:
        return f"{self.user.email} - Notifications"


class NotificationType(models.TextChoices):
    STOCK_AVAILABLE = "stock_available", "Stock Available"
    PRICE_DROP = "price_drop", "Price Drop"


class NotificationHistory(TimestampedModel):
    """History of sent notifications for analytics and avoiding duplicates."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_history",
        help_text="User who received notification",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="notification_history",
        help_text="Product the notification was about",
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        help_text="Type of notification sent",
    )

    title = models.CharField(max_length=255, help_text="Notification title")
    body = models.TextField(help_text="Notification body text")

    class Meta:
        verbose_name = "Notification History"
        verbose_name_plural = "Notification History"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["product", "notification_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} - {self.title}"
