from rest_framework import serializers
from apps.catalog.models.wishlist import WishlistItem
from apps.catalog.models.product import Product
from apps.catalog.serializers.product import ProductListSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for WishlistItem model."""

    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_visible=True),
        source="product",
        write_only=True,
    )

    class Meta:
        model = WishlistItem
        fields = [
            "id",
            "product",
            "product_id",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class WishlistItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wishlist items."""

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects,
        source="product",
    )

    class Meta:
        model = WishlistItem
        fields = ["product_id"]

    def validate(self, attrs):
        """Check if product is already in user's wishlist."""
        user = self.context["request"].user
        product = attrs["product"]
        if WishlistItem.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("Product is already in your wishlist.")

        return attrs


class WishlistCheckSerializer(serializers.Serializer):
    """Serializer for wishlist check response."""

    product_id = serializers.IntegerField()
    is_in_wishlist = serializers.BooleanField()
    wishlist_item_id = serializers.IntegerField(required=False, allow_null=True)
