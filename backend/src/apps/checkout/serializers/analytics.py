from rest_framework import serializers


class ShippingMethodEntrySerializer(serializers.Serializer):
    name = serializers.CharField()
    count = serializers.IntegerField()

    class Meta:
        ref_name = "ShippingMethodEntry"


class ShippingMethodsSerializer(serializers.Serializer):
    entries = ShippingMethodEntrySerializer(many=True)
    total = serializers.IntegerField()

    class Meta:
        ref_name = "ShippingMethods"


class ProductEntrySerializer(serializers.Serializer):
    name = serializers.CharField()
    qty = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ref_name = "ProductEntry"


class ProductsSerializer(serializers.Serializer):
    entries = ProductEntrySerializer(many=True)
    totalQty = serializers.IntegerField()

    class Meta:
        ref_name = "Products"


class ManufacturerEntrySerializer(serializers.Serializer):
    name = serializers.CharField()
    qty = serializers.IntegerField()

    class Meta:
        ref_name = "ManufacturerEntry"


class TagEntrySerializer(serializers.Serializer):
    name = serializers.CharField()
    qty = serializers.IntegerField()

    class Meta:
        ref_name = "TagEntry"


class CouponUsageSerializer(serializers.Serializer):
    used = serializers.IntegerField()
    total = serializers.IntegerField()

    class Meta:
        ref_name = "CouponUsage"


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard analytics response."""

    period = serializers.CharField()
    orders_count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    avg_order = serializers.DecimalField(max_digits=10, decimal_places=2)
    items_sold = serializers.IntegerField()
    shipping_methods = ShippingMethodsSerializer()
    products = ProductsSerializer()
    manufacturers = ManufacturerEntrySerializer(many=True)
    tags = TagEntrySerializer(many=True)
    coupon_usage = CouponUsageSerializer()

    class Meta:
        ref_name = "DashboardStats"
