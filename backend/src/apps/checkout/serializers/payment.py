from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer

from apps.checkout.models import Payment
from apps.profile.models import Address
from apps.checkout.models import ShippingMethod


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """Serializer for creating payment intent (PaymentSheet)."""

    currency = serializers.CharField(
        default="usd", max_length=3, help_text="Currency code (default: usd)"
    )
    shipping_address_id = serializers.IntegerField(
        help_text="ID of the shipping address to use for this order"
    )
    shipping_method_id = serializers.IntegerField(
        help_text="ID of the shipping method to use for this order"
    )

    def validate_shipping_address_id(self, value):
        """Validate that the shipping address exists and belongs to the user."""
        request = self.context.get("request")
        if request and request.user:
            try:
                Address.objects.get(id=value, profile__user=request.user)
                return value
            except Address.DoesNotExist:
                raise serializers.ValidationError("Shipping address not found")
        return value

    def validate_shipping_method_id(self, value):
        """Validate that the shipping method exists."""
        try:
            ShippingMethod.objects.get(id=value)
            return value
        except ShippingMethod.DoesNotExist:
            raise serializers.ValidationError("Shipping method not found")

    def set_shipping_on_cart(self, cart):
        """Set shipping address and method on the cart."""
        shipping_address_id = self.validated_data.get("shipping_address_id")
        shipping_method_id = self.validated_data.get("shipping_method_id")

        if shipping_address_id:
            address = Address.objects.get(id=shipping_address_id)
            cart.shipping_address = address

        if shipping_method_id:
            shipping_method = ShippingMethod.objects.get(id=shipping_method_id)
            cart.shipping_method = shipping_method

        cart.save()
        return cart


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for confirming payment."""

    session_id = serializers.CharField(help_text="Stripe checkout session ID")


class CheckoutSessionResponseSerializer(serializers.Serializer):
    """Serializer for payment intent response (PaymentSheet)."""

    client_secret = serializers.CharField()
    payment_intent_id = serializers.CharField()
    payment_id = serializers.IntegerField()


class PaymentConfirmationResponseSerializer(serializers.Serializer):
    """Serializer for payment confirmation response."""

    success = serializers.BooleanField()
    payment_id = serializers.IntegerField()
    order_number = serializers.CharField()
    message = serializers.CharField()
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""

    class Meta:
        model = Payment
        fields = [
            "id",
            "amount",
            "status",
            "stripe_payment_intent_id",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
