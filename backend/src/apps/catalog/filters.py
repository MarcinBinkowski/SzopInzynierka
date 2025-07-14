import django_filters

from apps.catalog.models import Product


class ProductFilter(django_filters.FilterSet):
    """Advanced filtering for Product model."""

    category = django_filters.NumberFilter(field_name="category__id")
    category__in = django_filters.BaseInFilter(
        field_name="category__id", lookup_expr="in"
    )
    tags = django_filters.CharFilter(method="filter_tags")
    current_price = django_filters.NumberFilter(method="filter_current_price")
    current_price__gte = django_filters.NumberFilter(method="filter_current_price_gte")
    current_price__lte = django_filters.NumberFilter(method="filter_current_price_lte")
    current_price__gt = django_filters.NumberFilter(method="filter_current_price_gt")
    current_price__lt = django_filters.NumberFilter(method="filter_current_price_lt")

    class Meta:
        model = Product
        fields = {
            "id": ["exact"],
            "name": ["exact", "icontains"],
            "slug": ["exact", "icontains"],
            "short_description": ["exact", "icontains"],
            "sku": ["exact", "icontains"],
            "price": ["exact", "gte", "lte", "gt", "lt"],
            "original_price": ["exact", "gte", "lte", "gt", "lt"],
            "stock_quantity": ["exact", "gte", "lte"],
            "is_visible": ["exact"],
            "category__name": ["exact", "icontains"],
            "manufacturer__name": ["exact", "icontains"],
            "created_at": ["exact", "gte", "lte"],
            "updated_at": ["exact", "gte", "lte"],
        }

    def filter_tags(self, queryset, name: str, value: str):
        """Filter products by tag slugs (comma-separated)."""
        if not value:
            return queryset

        tag_slugs = [slug.strip() for slug in value.split(",")]
        return queryset.filter(tags__slug__in=tag_slugs).distinct()

    def filter_current_price(self, queryset, name: str, value: float):
        """Filter products by exact current price."""
        from django.db.models import Q
        from django.utils import timezone

        now = timezone.now()
        return queryset.filter(
            Q(price=value, sale_start__lte=now, sale_end__gte=now)
            | Q(original_price=value, sale_start__isnull=True)
            | Q(original_price=value, sale_start__gt=now)
            | Q(original_price=value, sale_end__lt=now)
        )

    def filter_current_price_gte(self, queryset, name: str, value: float):
        """Filter products by current price >= value."""
        from django.db.models import Q
        from django.utils import timezone

        now = timezone.now()
        return queryset.filter(
            Q(price__gte=value, sale_start__lte=now, sale_end__gte=now)
            | Q(original_price__gte=value, sale_start__isnull=True)
            | Q(original_price__gte=value, sale_start__gt=now)
            | Q(original_price__gte=value, sale_end__lt=now)
        )

    def filter_current_price_lte(self, queryset, name: str, value: float):
        """Filter products by current price <= value."""
        from django.db.models import Q
        from django.utils import timezone

        now = timezone.now()
        return queryset.filter(
            Q(price__lte=value, sale_start__lte=now, sale_end__gte=now)
            | Q(original_price__lte=value, sale_start__isnull=True)
            | Q(original_price__lte=value, sale_start__gt=now)
            | Q(original_price__lte=value, sale_end__lt=now)
        )

    def filter_current_price_gt(self, queryset, name: str, value: float):
        """Filter products by current price > value."""
        from django.db.models import Q
        from django.utils import timezone

        now = timezone.now()
        return queryset.filter(
            Q(price__gt=value, sale_start__lte=now, sale_end__gte=now)
            | Q(original_price__gt=value, sale_start__isnull=True)
            | Q(original_price__gt=value, sale_start__gt=now)
            | Q(original_price__gt=value, sale_end__lt=now)
        )

    def filter_current_price_lt(self, queryset, name: str, value: float):
        """Filter products by current price < value."""
        from django.db.models import Q
        from django.utils import timezone

        now = timezone.now()
        return queryset.filter(
            Q(price__lt=value, sale_start__lte=now, sale_end__gte=now)
            | Q(original_price__lt=value, sale_start__isnull=True)
            | Q(original_price__lt=value, sale_start__gt=now)
            | Q(original_price__lt=value, sale_end__lt=now)
        )
