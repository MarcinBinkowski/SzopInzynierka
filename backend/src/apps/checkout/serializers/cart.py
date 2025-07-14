from rest_framework import serializers
from decimal import Decimal

from apps.checkout.models import Cart, CartItem
from apps.catalog.models import Product
from apps.catalog.serializers.product import ProductListSerializer
from apps.profile.serializers.address import AddressSerializer
from apps.checkout.serializers.shipping_method import ShippingMethodSerializer
from apps.checkout.serializers.coupon import CouponSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItem model."""

    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_visible=True),
        source="product",
        write_only=True,
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
            "unit_price",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "unit_price",
            "total_price",
            "created_at",
            "updated_at",
        ]

    def get_total_price(self, obj: CartItem) -> Decimal:
        """Get total price for this item."""
        return obj.total_price

    def validate_quantity(self, value: int) -> int:
        """Validate quantity against product stock."""
        product = self.initial_data.get("product_id")
        if product and hasattr(product, "stock_quantity"):
            if value > product.stock_quantity:
                raise serializers.ValidationError(
                    f"Requested quantity ({value}) exceeds available stock ({product.stock_quantity})"
                )
        return value


class CartItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating cart items."""

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_visible=True),
        source="product",
    )

    class Meta:
        model = CartItem
        fields = [
            "product_id",
            "quantity",
        ]

    def validate_quantity(self, value: int) -> int:
        """Validate quantity against product stock."""
        product = self.initial_data.get("product_id")
        if product and hasattr(product, "stock_quantity"):
            if value > product.stock_quantity:
                raise serializers.ValidationError(
                    f"Requested quantity ({value}) exceeds available stock ({product.stock_quantity})"
                )
        return value


class CartItemQuantitySerializer(serializers.Serializer):
    """Serializer for cart item quantity operations."""

    amount = serializers.IntegerField(
        default=1, min_value=1, help_text="Amount to increase/decrease quantity by"
    )


class CartItemUpdateQuantitySerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""

    quantity = serializers.IntegerField(
        min_value=1, help_text="New quantity for the cart item"
    )

    def validate_quantity(self, value: int) -> int:
        """Validate quantity against product stock."""
        cart_item = self.context.get("cart_item")
        if cart_item and cart_item.product.stock_quantity:
            if value > cart_item.product.stock_quantity:
                raise serializers.ValidationError(
                    f"Requested quantity ({value}) exceeds available stock ({cart_item.product.stock_quantity})"
                )
        return value


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart model."""

    items = CartItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    applied_coupon = CouponSerializer(read_only=True)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    shipping_cost = serializers.SerializerMethodField()
    coupon_discount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "user",
            "status",
            "items",
            "shipping_address",
            "shipping_method",
            "applied_coupon",
            "item_count",
            "subtotal",
            "shipping_cost",
            "coupon_discount",
            "total",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "item_count",
            "subtotal",
            "shipping_cost",
            "coupon_discount",
            "total",
            "created_at",
            "updated_at",
        ]

    def get_item_count(self, obj: Cart) -> int:
        """Get total number of items in cart."""
        return obj.item_count

    def get_subtotal(self, obj: Cart) -> Decimal:
        """Get subtotal of all items in cart."""
        return obj.subtotal

    def get_shipping_cost(self, obj: Cart) -> Decimal:
        """Get shipping cost from selected shipping method."""
        return obj.shipping_cost

    def get_coupon_discount(self, obj: Cart) -> Decimal:
        """Get coupon discount amount."""
        return obj.coupon_discount

    def get_total(self, obj: Cart) -> Decimal:
        """Get total including shipping."""
        return obj.total


class CartListSerializer(serializers.ModelSerializer):
    """Simplified cart serializer for list views."""

    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    shipping_cost = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "status",
            "item_count",
            "subtotal",
            "shipping_cost",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "item_count",
            "subtotal",
            "shipping_cost",
            "created_at",
        ]

    def get_item_count(self, obj: Cart) -> int:
        """Get total number of items in cart."""
        return obj.item_count

    def get_subtotal(self, obj: Cart) -> Decimal:
        """Get subtotal of all items in cart."""
        return obj.subtotal

    def get_shipping_cost(self, obj: Cart) -> Decimal:
        """Get shipping cost from selected shipping method."""
        return obj.shipping_cost
