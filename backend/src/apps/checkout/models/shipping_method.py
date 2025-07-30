from decimal import Decimal
from django.db import models

from apps.common.models import TimestampedModel


class ShippingMethod(TimestampedModel):
    """Available shipping methods for orders."""

    name = models.CharField(
        max_length=100,
        help_text="Name of the shipping method (e.g., 'Standard', 'Express')",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Shipping cost",
    )

    class Meta:
        ordering = ["price"]
        verbose_name = "Shipping Method"
        verbose_name_plural = "Shipping Methods"

    def __str__(self) -> str:
        return f"{self.name} - ${self.price}" 