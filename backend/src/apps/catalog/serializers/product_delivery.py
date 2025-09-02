from rest_framework import serializers

from apps.catalog.models import ProductDelivery


class ProductDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDelivery
        fields = [
            "id",
            "supplier",
            "product",
            "quantity",
            "delivery_date",
            "cost_per_unit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
