from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from apps.common.models import TimestampedModel
from apps.catalog.models.product import Product
from apps.catalog.models.supplier import Supplier


class ProductDelivery(TimestampedModel):
    """Product deliveries from suppliers that increase inventory."""

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="deliveries",
        help_text="Supplier who delivered the products",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="deliveries",
        help_text="Product that was delivered",
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)], help_text="Quantity of products delivered"
    )
    delivery_date = models.DateTimeField(help_text="When the delivery was received")
    cost_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Cost per unit for this delivery",
    )

    class Meta:
        ordering = ["-delivery_date"]
        verbose_name = "Product Delivery"
        verbose_name_plural = "Product Deliveries"

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product.name} from {self.supplier.name}"

    def save(self, *args, **kwargs):
        """Override save to automatically update product inventory."""
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new:
            self.product.stock_quantity += self.quantity
            self.product.save(update_fields=["stock_quantity"])
