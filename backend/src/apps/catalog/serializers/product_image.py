from rest_framework import serializers

from apps.catalog.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model."""
    
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "image_url",
            "alt_text",
            "is_primary",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "image_url", "created_at", "updated_at"]
    
    def get_image_url(self, obj: ProductImage) -> str | None:
        """Get full URL of the image."""
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
