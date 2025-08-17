from django.db import models
from apps.common.models import TimestampedModel


class Shipment(TimestampedModel):
    """Shipment tracking for orders."""
    
    order = models.OneToOneField(
        'Order',
        on_delete=models.CASCADE,
        related_name='shipment',
        help_text="Order this shipment is for"
    )
    shipping_method = models.ForeignKey(
        'ShippingMethod',
        on_delete=models.PROTECT,
        related_name='shipments',
        help_text="Shipping method used"
    )
    courier = models.ForeignKey(
        'Courier',
        on_delete=models.PROTECT,
        related_name='shipments',
        help_text="Courier company handling the shipment"
    )
    shipped_at = models.DateTimeField(help_text="When the package was shipped")
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the package was delivered"
    )
    shipping_address = models.TextField(help_text="Shipping address at time of shipment")
    
    class Meta:
        ordering = ['-shipped_at']
        verbose_name = "Shipment"
        verbose_name_plural = "Shipments"
    
    def __str__(self) -> str:
        return f"Shipment for Order {self.order.order_number} via {self.courier.name}"
    
    @property
    def is_delivered(self) -> bool:
        """Check if shipment has been delivered."""
        return self.delivered_at is not None 