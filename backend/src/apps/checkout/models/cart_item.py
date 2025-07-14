from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator

from apps.common.models import TimestampedModel
from apps.catalog.models import Product


class CartItem(TimestampedModel):
    """Individual item in a shopping cart."""

    cart = models.ForeignKey(
        "Cart",
        on_delete=models.CASCADE,
        related_name="items",
        help_text="Cart this item belongs to",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
        help_text="Product in the cart",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Quantity of this product in cart",
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Price per unit when added to cart",
    )

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["cart", "product"]),
            models.Index(fields=["product", "quantity"]),
        ]
        unique_together = ["cart", "product"]

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product.name} in Cart {self.cart.id}"

    def save(self, *args, **kwargs) -> None:
        """Set unit price from product if not provided."""
        if not self.unit_price:
            self.unit_price = self.product.current_price
        super().save(*args, **kwargs)

    @property
    def total_price(self) -> Decimal:
        """Calculate total price for this item."""
        return self.unit_price * self.quantity

    @property
    def is_available(self) -> bool:
        """Check if product is still available for purchase."""
        return self.product.is_available

    @property
    def stock_available(self) -> bool:
        """Check if requested quantity is available in stock."""
        return self.product.stock_quantity >= self.quantity

    def update_quantity(self, new_quantity: int) -> None:
        """Update item quantity with validation."""
        if new_quantity <= 0:
            self.delete()
        else:
            self.quantity = new_quantity
            self.save()

    def increase_quantity(self, amount: int = 1) -> None:
        """Increase item quantity."""
        self.update_quantity(self.quantity + amount)

    def decrease_quantity(self, amount: int = 1) -> None:
        """Decrease item quantity."""
        self.update_quantity(self.quantity - amount)
