from django.db import models

from apps.common.models import TimestampedModel
from apps.checkout.models.courier import Courier


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
    courier = models.ForeignKey(
        Courier,
        on_delete=models.PROTECT,
        related_name="shipping_methods",
        help_text="Courier company providing this shipping method",
    )

    class Meta:
        ordering = ["price"]
        verbose_name = "Shipping Method"
        verbose_name_plural = "Shipping Methods"

    def __str__(self) -> str:
        return f"{self.name} - ${self.price} via {self.courier.name}"
