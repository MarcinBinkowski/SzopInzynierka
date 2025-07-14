from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.checkout.models.coupon import Coupon
from apps.checkout.models.cart import Cart

User = get_user_model()


class CouponService:
    @staticmethod
    def validate_coupon(coupon: Coupon, user: User, cart: Cart) -> tuple[bool, str]:
        """Validate if coupon can be applied."""
        now = timezone.now()
        if now < coupon.valid_from:
            return (
                False,
                f"Coupon '{coupon.code}' is not valid yet. Valid from {coupon.valid_from.strftime('%Y-%m-%d')}",
            )

        if now > coupon.valid_until:
            return (
                False,
                f"Coupon '{coupon.code}' has expired. Valid until {coupon.valid_until.strftime('%Y-%m-%d')}",
            )

        if coupon.max_uses and coupon.redemptions.count() >= coupon.max_uses:
            return False, f"Coupon '{coupon.code}' usage limit exceeded"

        user_redemptions = coupon.redemptions.filter(user=user).count()
        if user_redemptions >= coupon.max_uses_per_user:
            return (
                False,
                f"You have already used coupon '{coupon.code}' {user_redemptions} out of maximum {coupon.max_uses_per_user} uses.",
            )

        return True, "Coupon is valid"

    @staticmethod
    def calculate_discount(coupon: Coupon, cart: Cart) -> Decimal:
        """Calculate fixed discount amount (can reduce total to zero)."""
        return min(coupon.discount_amount, cart.subtotal + cart.shipping_cost)
