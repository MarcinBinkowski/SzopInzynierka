from django.db import models

from apps.common.models import TimestampedModel
from apps.catalog.models import Product


class OrderItem(TimestampedModel):
    """Individual item in an order."""

    order = models.ForeignKey(
        "Order",
        on_delete=models.CASCADE,
        related_name="items",
        help_text="Order this item belongs to",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
        help_text="Product that was ordered",
    )
    quantity = models.PositiveIntegerField(
        help_text="Quantity ordered",
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price per unit at time of order",
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total price for this item (quantity × unit_price)",
    )

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
        indexes = [
            models.Index(fields=["order", "product"]),
            models.Index(fields=["product", "quantity"]),
        ]

    def __str__(self) -> str:
        return (
            f"{self.quantity}x {self.product.name} in Order {self.order.order_number}"
        )

    def save(self, *args, **kwargs) -> None:
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
