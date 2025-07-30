from rest_framework import serializers
from decimal import Decimal


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """Serializer for creating payment intent (PaymentSheet)."""
    
    currency = serializers.CharField(
        default="usd",
        max_length=3,
        help_text="Currency code (default: usd)"
    )


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for confirming payment."""
    
    session_id = serializers.CharField(
        help_text="Stripe checkout session ID"
    )


class CancelPaymentSerializer(serializers.Serializer):
    """Serializer for canceling payment."""
    
    session_id = serializers.CharField(
        help_text="Stripe checkout session ID"
    )


class PaymentStatusResponseSerializer(serializers.Serializer):
    """Serializer for payment status response."""
    
    payment_id = serializers.IntegerField()
    status = serializers.CharField()
    amount = serializers.CharField()
    session_id = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField()


class CartPaymentStatusResponseSerializer(serializers.Serializer):
    """Serializer for cart payment status response."""
    
    cart_id = serializers.IntegerField()
    payment_status = serializers.CharField()
    amount = serializers.CharField()
    session_id = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField(allow_null=True)


class CheckoutSessionResponseSerializer(serializers.Serializer):
    """Serializer for payment intent response (PaymentSheet)."""
    
    client_secret = serializers.CharField()
    payment_intent_id = serializers.CharField()
    payment_id = serializers.IntegerField()


class PaymentConfirmationResponseSerializer(serializers.Serializer):
    """Serializer for payment confirmation response."""
    
    success = serializers.BooleanField()
    payment_id = serializers.IntegerField()
    message = serializers.CharField()
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()


class PaymentCancelResponseSerializer(serializers.Serializer):
    """Serializer for payment cancellation response."""
    
    success = serializers.BooleanField()
    message = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    """Serializer for error responses."""
    
    error = serializers.CharField() 