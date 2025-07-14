from rest_framework import serializers

from apps.catalog.models.product_image import ProductImage
from shopdjango.utils import presign_download


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product",
            "image",
            "image_url",
            "is_primary",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "image_url", "created_at", "updated_at"]

    def get_image_url(self, obj: ProductImage) -> str | None:
        if obj.image:
            return presign_download(obj.image.name, expires=3600, as_attachment=False)
        return None
