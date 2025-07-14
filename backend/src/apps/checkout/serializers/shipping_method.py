from rest_framework import serializers

from apps.checkout.models import ShippingMethod


class ShippingMethodSerializer(serializers.ModelSerializer):
    """Serializer for ShippingMethod model."""

    class Meta:
        model = ShippingMethod
        fields = [
            "id",
            "name",
            "price",
            "courier",
        ]
        read_only_fields = [
            "id",
        ]
