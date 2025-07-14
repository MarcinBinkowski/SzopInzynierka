from django.db import models
from apps.common.models import TimestampedModel


class PaymentStatus(TimestampedModel):
    """Payment status options stored as separate table for flexibility."""

    code = models.CharField(
        max_length=20, unique=True, help_text="Unique payment status code"
    )
    name = models.CharField(max_length=100, help_text="Display name")

    class Meta:
        ordering = ["name"]
        verbose_name = "Payment Status"
        verbose_name_plural = "Payment Statuses"

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

    @classmethod
    def get_default_status(cls):
        """Get the default pending status."""
        return cls.objects.filter(code="pending").first()
