from django.db import models
from apps.common.models import TimestampedModel


class Courier(TimestampedModel):
    """Shipping courier companies."""

    name = models.CharField(max_length=100, help_text="Courier company name")

    class Meta:
        ordering = ["name"]
        verbose_name = "Courier"
        verbose_name_plural = "Couriers"

    def __str__(self) -> str:
        return self.name
