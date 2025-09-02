import django_filters
from datetime import datetime

from apps.catalog.models import Product


class ProductFilter(django_filters.FilterSet):
    """Advanced filtering for Product model."""

    # Price range filtering
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    # Category filtering
    category = django_filters.NumberFilter(field_name="category__id")
    category__in = django_filters.BaseInFilter(
        field_name="category__id", lookup_expr="in"
    )

    # Tag filtering
    tags = django_filters.CharFilter(method="filter_tags")

    # Availability filtering
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    on_sale = django_filters.BooleanFilter(method="filter_on_sale")

    # Status filtering
    status = django_filters.MultipleChoiceFilter(choices=Product.ProductStatus.choices)

    created_at__date__gte = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__gte"
    )
    created_at__date__lte = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__lte"
    )

    # Date range filtering
    date_range = django_filters.CharFilter(method="filter_date_range")

    class Meta:
        model = Product
        fields = {
            "name": ["icontains"],
            "sku": ["exact", "icontains"],
            "price": ["exact", "gte", "lte"],
            "stock_quantity": ["exact", "gte", "lte"],
            "is_visible": ["exact"],
            # Remove created_at from Meta since we're handling it explicitly
        }

    def filter_tags(self, queryset, name: str, value: str):
        """Filter products by tag slugs (comma-separated)."""
        if not value:
            return queryset

        tag_slugs = [slug.strip() for slug in value.split(",")]
        return queryset.filter(tags__slug__in=tag_slugs).distinct()

    def filter_in_stock(self, queryset, name: str, value: bool):
        """Filter products by stock availability."""
        if value is True:
            return queryset.filter(stock_quantity__gt=0)
        elif value is False:
            return queryset.filter(stock_quantity=0)
        return queryset

    def filter_on_sale(self, queryset, name: str, value: bool):
        """Filter products by sale status."""
        if not value:
            return queryset

        from django.utils import timezone

        now = timezone.now()

        if value is True:
            return queryset.filter(sale_start__lte=now, sale_end__gte=now)

        return queryset.exclude(sale_start__lte=now, sale_end__gte=now)

    def filter_date_range(self, queryset, name: str, value: str):
        """Filter by date range using various formats."""
        if not value:
            return queryset

        # Handle different date range formats
        if "," in value:
            # Range format: "2025-07-01,2025-07-03"
            start_str, end_str = value.split(",", 1)
            try:
                start_date = datetime.strptime(start_str.strip(), "%Y-%m-%d").date()
                end_date = datetime.strptime(end_str.strip(), "%Y-%m-%d").date()
                return queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                )
            except ValueError:
                return queryset
        else:
            # Single date format: "2025-07-01"
            try:
                target_date = datetime.strptime(value.strip(), "%Y-%m-%d").date()
                return queryset.filter(created_at__date=target_date)
            except ValueError:
                return queryset
