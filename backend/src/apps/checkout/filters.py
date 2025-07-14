import django_filters

from apps.checkout.models.order import Order


class OrderFilter(django_filters.FilterSet):
    """Custom filter for Order model with date range support."""

    created_at__gte = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
        help_text="Filter orders created after this date",
    )
    created_at__lte = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
        help_text="Filter orders created before this date",
    )

    address_line_1 = django_filters.CharFilter(
        field_name="shipping_address__address_line_1",
        lookup_expr="icontains",
        help_text="Search by address line 1",
    )
    city = django_filters.CharFilter(
        field_name="shipping_address__city",
        lookup_expr="icontains",
        help_text="Search by city",
    )
    postal_code = django_filters.CharFilter(
        field_name="shipping_address__postal_code",
        lookup_expr="icontains",
        help_text="Search by postal code",
    )
    country = django_filters.CharFilter(
        field_name="shipping_address__country__name",
        lookup_expr="icontains",
        help_text="Search by country name",
    )

    class Meta:
        model = Order
        fields = {
            "status": ["exact"],
            "user": ["exact"],
            "created_at": ["exact", "gte", "lte"],
        }
