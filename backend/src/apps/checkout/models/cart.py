from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model

from apps.common.models import TimestampedModel

User = get_user_model()


class Cart(TimestampedModel):
    """Shopping cart model for users."""

    class CartStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        CONVERTED = "converted", "Converted to Order"
        ABANDONED = "abandoned", "Abandoned"
        EXPIRED = "expired", "Expired"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="carts",
        null=True,
        blank=True,
        help_text="User who owns this cart",
    )
    status = models.CharField(
        max_length=20,
        choices=CartStatus.choices,
        default=CartStatus.ACTIVE,
        help_text="Current status of the cart",
    )
    shipping_address = models.ForeignKey(
        "profile.Address",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="carts",
        help_text="Selected shipping address for this cart",
    )
    shipping_method = models.ForeignKey(
        "ShippingMethod",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="carts",
        help_text="Selected shipping method for this cart",
    )
    applied_coupon = models.ForeignKey(
        "Coupon",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="carts",
        help_text="Applied coupon to this cart",
    )
    coupon_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Discount amount from applied coupon",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        username = self.user.username if self.user else "Anonymous"
        return f"Cart {self.id} - {username} ({self.status})"

    @property
    def item_count(self) -> int:
        """Get total number of items in cart."""
        return self.items.aggregate(total=models.Sum("quantity"))["total"] or 0

    @property
    def subtotal(self) -> Decimal:
        """Calculate subtotal of all items in cart."""
        total = Decimal("0.00")
        for item in self.items.all():
            total += item.total_price
        return total

    @property
    def shipping_cost(self) -> Decimal:
        """Get shipping cost from selected shipping method."""
        if self.shipping_method:
            return self.shipping_method.price
        return Decimal("0.00")

    @property
    def total(self) -> Decimal:
        """Calculate total (subtotal + shipping - coupon discount)."""
        return self.subtotal + self.shipping_cost - self.coupon_discount

    @property
    def total_before_coupon(self) -> Decimal:
        """Calculate total before coupon discount."""
        return self.subtotal + self.shipping_cost

    def clear(self) -> None:
        """Remove all items from cart."""
        self.items.all().delete()

    def is_empty(self) -> bool:
        """Check if cart has any items."""
        return self.item_count == 0

    @classmethod
    def get_or_create_active_cart(
        cls,
        user: User,
    ) -> "Cart":
        """Get existing active cart or create new one."""
        if user.is_authenticated:
            cart, created = cls.objects.get_or_create(
                user=user,
                status=cls.CartStatus.ACTIVE,
            )
            return cart
        raise ValueError("User must be authenticated to get or create cart")
