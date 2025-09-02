from typing import TYPE_CHECKING
from django.db import models
from django.utils import timezone
from django.db.models import F

if TYPE_CHECKING:
    pass


class ProductQuerySet(models.QuerySet["Product"]):
    """Custom QuerySet for Product model with chainable methods."""

    def active(self) -> "ProductQuerySet":
        """Filter for active products only."""
        return self.filter(status="active")

    def in_stock(self) -> "ProductQuerySet":
        """Filter for products that are in stock."""
        return self.filter(stock_quantity__gt=0)

    def available(self) -> "ProductQuerySet":
        """Filter for products available for purchase."""
        return self.active().in_stock()

    def featured(self) -> "ProductQuerySet":
        """Filter for featured products."""
        return self.filter(is_featured=True)

    def by_category(self, category_slug: str) -> "ProductQuerySet":
        """Filter products by category slug."""
        return self.filter(category__slug=category_slug)

    def on_sale(self) -> "ProductQuerySet":
        """Filter for products on sale."""
        now = timezone.now()
        return self.filter(
            sale_start__lte=now, sale_end__gte=now, price__lt=F("original_price")
        )

    def search(self, query: str) -> "ProductQuerySet":
        """Search products by name and description."""
        return self.filter(
            models.Q(name__icontains=query)
            | models.Q(description__icontains=query)
            | models.Q(short_description__icontains=query)
        )

    def with_images(self) -> "ProductQuerySet":
        """Prefetch product images for efficiency."""
        return self.prefetch_related("images")

    def with_category(self) -> "ProductQuerySet":
        """Select related category for efficiency."""
        return self.select_related("category")
