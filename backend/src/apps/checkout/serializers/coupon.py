from rest_framework import serializers
from apps.checkout.models.coupon import Coupon, CouponRedemption


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon list and detail views."""
    
    usage_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "name",
            "description",
            "discount_amount",
            "valid_from",
            "valid_until",
            "max_uses",
            "max_uses_per_user",
            "usage_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CouponRedemptionSerializer(serializers.ModelSerializer):
    """Serializer for coupon redemption tracking."""

    coupon = CouponSerializer(read_only=True)

    class Meta:
        model = CouponRedemption
        fields = [
            "id",
            "coupon",
            "discount_amount",
            "original_total",
            "final_total",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CouponValidationRequestSerializer(serializers.Serializer):
    """Serializer for coupon validation request."""

    code = serializers.CharField(max_length=20, help_text="Coupon code to validate")


class CouponValidationResponseSerializer(serializers.Serializer):
    """Serializer for coupon validation response."""

    coupon = CouponSerializer()
    applied_discount = serializers.CharField()
    cart_total = serializers.CharField()


class CouponRemoveRequestSerializer(serializers.Serializer):
    """Serializer for coupon removal request (no data needed)."""

    pass


class CouponRemoveResponseSerializer(serializers.Serializer):
    """Serializer for coupon removal response."""

    message = serializers.CharField()
