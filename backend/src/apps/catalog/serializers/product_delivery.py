from rest_framework import serializers

from apps.catalog.models import ProductDelivery


class ProductDeliverySerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductDelivery
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "product",
            "product_name",
            "quantity",
            "delivery_date",
            "cost_per_unit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "supplier_name",
            "product_name",
            "created_at",
            "updated_at",
        ]
