from rest_framework import serializers
from apps.checkout.models.coupon import Coupon, CouponRedemption


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon list and detail views."""
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'name', 'description', 'discount_amount', 
                 'valid_from', 'valid_until', 'max_uses', 'max_uses_per_user']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CouponRedemptionSerializer(serializers.ModelSerializer):
    """Serializer for coupon redemption tracking."""
    
    coupon = CouponSerializer(read_only=True)
    
    class Meta:
        model = CouponRedemption
        fields = ['id', 'coupon', 'discount_amount', 'original_total', 'final_total', 'created_at']
        read_only_fields = ['id', 'created_at'] 

class CouponValidationResponseSerializer(serializers.Serializer):
    """Serializer for coupon validation response."""
    message = serializers.CharField()
    discount = serializers.CharField()
    new_total = serializers.CharField()


class CouponMessageResponseSerializer(serializers.Serializer):
    """Serializer for simple message responses."""
    message = serializers.CharField()