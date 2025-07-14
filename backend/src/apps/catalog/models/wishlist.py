from django.db import models
from django.conf import settings
from apps.common.models import TimestampedModel
from apps.catalog.models.product import Product


class WishlistItem(TimestampedModel):
    """Model for tracking user's wishlist items."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        help_text="User who added this item to wishlist",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        help_text="Product in the wishlist",
    )

    class Meta:
        verbose_name = "Wishlist Item"
        verbose_name_plural = "Wishlist Items"
        ordering = ["-created_at"]
        unique_together = ["user", "product"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["product"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} - {self.product.name}"
