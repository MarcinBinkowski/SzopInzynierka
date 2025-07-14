from django.db import models
from apps.common.models import TimestampedModel


class Shipment(TimestampedModel):
    """Shipment tracking for orders."""

    order = models.OneToOneField(
        "Order",
        on_delete=models.CASCADE,
        related_name="shipment",
        help_text="Order this shipment is for",
    )
    shipped_at = models.DateTimeField(
        null=True, blank=True, help_text="When the package was shipped"
    )
    delivered_at = models.DateTimeField(
        null=True, blank=True, help_text="When the package was delivered"
    )
    shipping_address = models.TextField(
        help_text="Shipping address at time of shipment"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Shipment"
        verbose_name_plural = "Shipments"

    def __str__(self) -> str:
        return f"Shipment for Order {self.order.order_number}"

    @property
    def shipping_method(self):
        """Get shipping method from the related order."""
        return self.order.shipping_method

    @property
    def courier(self):
        """Get courier from the related order's shipping method."""
        return (
            self.order.shipping_method.courier if self.order.shipping_method else None
        )

    @property
    def is_delivered(self) -> bool:
        """Check if shipment has been delivered."""
        return self.delivered_at is not None
