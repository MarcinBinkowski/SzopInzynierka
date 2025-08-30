from rest_framework import serializers

from apps.checkout.models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            "id",
            "order",
            "shipping_method",
            "courier",
            "shipped_at",
            "delivered_at",
            "shipping_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


