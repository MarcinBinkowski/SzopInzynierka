from django.db import models
from django.contrib.auth import get_user_model

from apps.common.models import TimestampedModel

User = get_user_model()


class Coupon(TimestampedModel):
    """Coupon model for fixed amount discounts."""

    code = models.CharField(max_length=20, unique=True, help_text="Coupon code")
    name = models.CharField(max_length=100, help_text="Display name")
    description = models.TextField(blank=True)

    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Fixed discount amount"
    )

    max_uses = models.PositiveIntegerField(
        null=True, blank=True, help_text="Maximum total uses (null = unlimited)"
    )
    max_uses_per_user = models.PositiveIntegerField(
        default=1, help_text="Maximum uses per user"
    )

    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class CouponRedemption(TimestampedModel):
    """Track coupon usage by users."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="coupon_redemptions"
    )
    coupon = models.ForeignKey(
        Coupon, on_delete=models.CASCADE, related_name="redemptions"
    )
    order = models.ForeignKey(
        "Order", on_delete=models.CASCADE, related_name="coupon_redemptions"
    )

    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    original_total = models.DecimalField(max_digits=10, decimal_places=2)
    final_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ["user", "coupon", "order"]
        ordering = ["-created_at"]
        verbose_name = "Coupon Redemption"
        verbose_name_plural = "Coupon Redemptions"

    def __str__(self) -> str:
        return f"{self.user.username} - {self.coupon.code} - {self.order.order_number}"
