from rest_framework import serializers
from apps.catalog.models import Manufacturer, Product
from drf_spectacular.utils import extend_schema_field


class ManufacturerSerializer(serializers.ModelSerializer):
    """Serializer for Manufacturer model."""

    active_product_count = serializers.SerializerMethodField()

    class Meta:
        model = Manufacturer
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "website",
            "is_active",
            "active_product_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "active_product_count"]

    @extend_schema_field(serializers.IntegerField)
    def get_active_product_count(self, obj: Manufacturer) -> int:
        """Get count of active products from this manufacturer."""
        return obj.products.filter(status=Product.ProductStatus.ACTIVE).count()


class ManufacturerListSerializer(serializers.ModelSerializer):
    """Simplified manufacturer serializer for list views."""

    class Meta:
        model = Manufacturer
        fields = [
            "id",
            "name",
            "slug",
            "is_active",
        ]


class ManufacturerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new manufacturers (admin only)."""

    class Meta:
        model = Manufacturer
        fields = [
            "name",
            "description",
            "website",
            "is_active",
        ]

    def validate_name(self, value: str) -> str:
        """Validate and normalize manufacturer name."""
        if value:
            value = value.strip()
            if len(value) < 2:
                raise serializers.ValidationError(
                    "Manufacturer name must be at least 2 characters"
                )
        return value


class ManufacturerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating manufacturers (admin only)."""

    class Meta:
        model = Manufacturer
        fields = [
            "name",
            "description",
            "website",
            "is_active",
        ]

    def validate_name(self, value: str) -> str:
        """Validate and normalize manufacturer name."""
        if value:
            value = value.strip()
            if len(value) < 2:
                raise serializers.ValidationError(
                    "Manufacturer name must be at least 2 characters"
                )
        return value
