from django.db import models
from apps.common.models import TimestampedModel


class NotificationType(TimestampedModel):
    """Notification type options stored as separate table for flexibility."""

    code = models.CharField(
        max_length=20, unique=True, help_text="Unique notification type code"
    )
    name = models.CharField(max_length=100, help_text="Display name")

    class Meta:
        ordering = ["name"]
        verbose_name = "Notification Type"
        verbose_name_plural = "Notification Types"

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
