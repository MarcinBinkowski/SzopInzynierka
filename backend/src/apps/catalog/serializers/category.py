from rest_framework import serializers
from apps.catalog.models.category import Category
from drf_spectacular.utils import extend_schema_field


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    active_product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "active_product_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "active_product_count"]

    @extend_schema_field(serializers.IntegerField)
    def get_active_product_count(self, obj: Category) -> int:
        """Get count of visible products in this category."""
        return obj.products.filter(is_visible=True).count()
