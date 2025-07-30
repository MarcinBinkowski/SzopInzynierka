from rest_framework import serializers
from decimal import Decimal

from apps.checkout.models import Cart, CartItem
from apps.catalog.models import Product
from apps.catalog.serializers.product import ProductListSerializer
from apps.profile.serializers.address import AddressSerializer
from apps.checkout.serializers.shipping_method import ShippingMethodSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItem model."""

    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status=Product.ProductStatus.ACTIVE),
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
        queryset=Product.objects.filter(status=Product.ProductStatus.ACTIVE),
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
        default=1,
        min_value=1,
        help_text="Amount to increase/decrease quantity by"
    )


class CartItemUpdateQuantitySerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""
    
    quantity = serializers.IntegerField(
        min_value=1,
        help_text="New quantity for the cart item"
    )

    def validate_quantity(self, value: int) -> int:
        """Validate quantity against product stock."""
        cart_item = self.context.get('cart_item')
        if cart_item and cart_item.product.stock_quantity:
            if value > cart_item.product.stock_quantity:
                raise serializers.ValidationError(
                    f"Requested quantity ({value}) exceeds available stock ({cart_item.product.stock_quantity})"
                )
        return value


class CartShippingAddressSerializer(serializers.Serializer):
    """Serializer for setting shipping address on cart."""
    
    address_id = serializers.IntegerField(
        help_text="ID of the shipping address to set on the cart"
    )

    def validate_address_id(self, value):
        """Validate that the shipping address exists and belongs to the user."""
        request = self.context.get('request')
        if request and request.user:
            try:
                from apps.profile.models import Address
                Address.objects.get(
                    id=value,
                    profile__user=request.user,
                    address_type='shipping'
                )
                return value
            except Address.DoesNotExist:
                raise serializers.ValidationError("Shipping address not found")
        return value


class CartShippingMethodSerializer(serializers.Serializer):
    """Serializer for setting shipping method on cart."""
    
    shipping_method_id = serializers.IntegerField(
        help_text="ID of the shipping method to set on the cart"
    )

    def validate_shipping_method_id(self, value):
        """Validate that the shipping method exists."""
        try:
            from apps.checkout.models import ShippingMethod
            ShippingMethod.objects.get(id=value)
            return value
        except ShippingMethod.DoesNotExist:
            raise serializers.ValidationError("Shipping method not found")


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart model."""

    items = CartItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    shipping_cost = serializers.SerializerMethodField()
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
            "item_count",
            "subtotal",
            "shipping_cost",
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
