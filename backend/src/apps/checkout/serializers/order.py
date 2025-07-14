from rest_framework import serializers
from apps.checkout.models.order import Order, OrderItem
from apps.catalog.serializers.product import ProductDetailSerializer
from apps.profile.serializers.address import AddressSerializer
from apps.checkout.serializers.shipping_method import ShippingMethodSerializer
from apps.checkout.serializers.coupon import CouponSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""

    product = ProductDetailSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "unit_price", "total_price"]


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for order list view."""

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "shipping_cost",
            "coupon_discount",
            "total",
            "created_at",
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view."""

    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    applied_coupon = CouponSerializer(read_only=True)
    status = serializers.ChoiceField(choices=Order.OrderStatus.choices)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "shipping_cost",
            "coupon_discount",
            "total",
            "created_at",
            "notes",
            "shipping_address",
            "shipping_method",
            "applied_coupon",
            "items",
        ]
