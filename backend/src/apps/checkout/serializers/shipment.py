from rest_framework import serializers

from apps.checkout.models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    shipping_method = serializers.ReadOnlyField(source="shipping_method.name")
    courier = serializers.ReadOnlyField(source="courier.name")
    order_number = serializers.ReadOnlyField(source="order.order_number")
    order_status = serializers.ReadOnlyField(source="order.status")
    order_user_email = serializers.ReadOnlyField(source="order.user.email")

    class Meta:
        model = Shipment
        fields = [
            "id",
            "order",
            "order_number",
            "order_status",
            "order_user_email",
            "shipping_method",
            "courier",
            "shipped_at",
            "delivered_at",
            "shipping_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order",
            "order_number",
            "order_status",
            "order_user_email",
            "shipping_method",
            "courier",
            "created_at",
            "updated_at",
        ]
