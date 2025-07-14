from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

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
    session_key = models.CharField(
        max_length=40,
        blank=True,
        null=True,
        help_text="Session key for anonymous users",
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
    def total(self) -> Decimal:
        """Calculate total including taxes and shipping (placeholder)."""
        # TODO: Add tax and shipping calculation
        return self.subtotal

    def clear(self) -> None:
        """Remove all items from cart."""
        self.items.all().delete()

    def is_empty(self) -> bool:
        """Check if cart has any items."""
        return self.item_count == 0

    @classmethod
    def get_or_create_active_cart(cls, user: User, session_key: str = None) -> "Cart":
        """Get existing active cart or create new one."""
        if user.is_authenticated:
            cart, created = cls.objects.get_or_create(
                user=user,
                status=cls.CartStatus.ACTIVE,
                defaults={"session_key": session_key},
            )
        else:
            cart, created = cls.objects.get_or_create(
                session_key=session_key,
                status=cls.CartStatus.ACTIVE,
                defaults={"user": None},
            )
        return cart
