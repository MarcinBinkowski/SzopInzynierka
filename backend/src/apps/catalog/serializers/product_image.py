from rest_framework import serializers

from apps.catalog.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model."""

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text",
            "is_primary",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
