from rest_framework import serializers
from typing import Dict, Any

from apps.catalog.models.category import Category
from apps.catalog.models.manufacturer import Manufacturer
from apps.catalog.models.product import Product
from apps.catalog.models.tag import Tag
from apps.catalog.serializers.category import CategorySerializer
from apps.catalog.serializers.manufacturer import ManufacturerSerializer
from apps.catalog.serializers.product_image import ProductImageSerializer
from apps.catalog.serializers.tag import TagSerializer
from shopdjango.utils import presign_download


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product listings."""

    category = CategorySerializer(read_only=True)
    manufacturer = ManufacturerSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "price",
            "original_price",
            "current_price",
            "discount_percentage",
            "sku",
            "stock_quantity",
            "is_visible",
            "is_on_sale",
            "is_in_stock",
            "is_available",
            "category",
            "manufacturer",
            "primary_image",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "current_price",
            "discount_percentage",
            "is_on_sale",
            "is_in_stock",
            "is_available",
            "primary_image",
            "created_at",
        ]

    def get_primary_image(self, obj: Product) -> str | None:
        """Get URL of primary product image."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            return presign_download(
                primary_image.image.name, expires=3600, as_attachment=False
            )
        return None

    def get_current_price(self, obj: Product) -> str:
        """Get current price as formatted decimal string."""
        return f"{obj.current_price:.2f}"


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product detail views."""

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source="category",
        write_only=True,
    )
    manufacturer = ManufacturerSerializer(read_only=True)
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.filter(is_active=True),
        source="manufacturer",
        write_only=True,
        required=False,
        allow_null=True,
    )
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source="tags",
        many=True,
        write_only=True,
        required=False,
    )
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "price",
            "original_price",
            "current_price",
            "discount_percentage",
            "sku",
            "stock_quantity",
            "category",
            "category_id",
            "manufacturer",
            "manufacturer_id",
            "tags",
            "tag_ids",
            "is_visible",
            "sale_start",
            "sale_end",
            "is_on_sale",
            "is_in_stock",
            "is_available",
            "images",
            "primary_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "current_price",
            "discount_percentage",
            "is_on_sale",
            "is_in_stock",
            "is_available",
            "images",
            "primary_image",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate product data."""
        sale_start = attrs.get("sale_start")
        sale_end = attrs.get("sale_end")

        if sale_start and sale_end and sale_start >= sale_end:
            raise serializers.ValidationError(
                "Sale start date must be before sale end date."
            )

        price = attrs.get("price")
        original_price = attrs.get("original_price")

        if price and original_price and price > original_price:
            raise serializers.ValidationError(
                "Sale price cannot be higher than original price."
            )

        return attrs

    def get_primary_image(self, obj: Product) -> str | None:
        """Get URL of primary product image."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            return presign_download(
                primary_image.image.name, expires=3600, as_attachment=False
            )
        return None

    def get_current_price(self, obj: Product) -> str:
        """Get current price as formatted decimal string."""
        return f"{obj.current_price:.2f}"


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products."""

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True), source="category"
    )
    manufacturer_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufacturer.objects.filter(is_active=True),
        source="manufacturer",
        required=False,
        allow_null=True,
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source="tags", many=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "name",
            "slug",
            "description",
            "short_description",
            "price",
            "original_price",
            "sku",
            "stock_quantity",
            "category_id",
            "manufacturer_id",
            "tag_ids",
            "is_visible",
            "sale_start",
            "sale_end",
        ]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate product creation data."""
        sale_start = attrs.get("sale_start")
        sale_end = attrs.get("sale_end")

        if sale_start and sale_end and sale_start >= sale_end:
            raise serializers.ValidationError(
                "Sale start date must be before sale end date."
            )

        price = attrs.get("price")
        original_price = attrs.get("original_price")

        if price and original_price and price > original_price:
            raise serializers.ValidationError(
                "Sale price cannot be higher than original price."
            )

        return attrs
