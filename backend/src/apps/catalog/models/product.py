from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify
from django.utils import timezone

from apps.common.models import TimestampedModel
from apps.catalog.models.category import Category
from apps.catalog.models.manufacturer import Manufacturer


class Product(TimestampedModel):
    """Main product model."""

    name = models.CharField(max_length=200, help_text="Product name")
    slug = models.SlugField(
        max_length=200, unique=True, help_text="URL-friendly version of the name"
    )
    description = models.TextField(help_text="Detailed product description")
    short_description = models.CharField(
        max_length=500, blank=True, help_text="Short description for listings"
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Product price",
    )
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Original price for showing discounts",
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique product identifier",
    )
    stock_quantity = models.PositiveIntegerField(
        default=0, help_text="Available quantity in stock"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        help_text="Product category",
    )
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.PROTECT,
        related_name="products",
        null=True,
        blank=True,
        help_text="Product manufacturer",
    )
    tags = models.ManyToManyField(
        "Tag", blank=True, help_text="Tags for filtering and search"
    )

    is_visible = models.BooleanField(
        default=False, help_text="Is product visible to the users"
    )

    sale_start = models.DateTimeField(null=True, blank=True)
    sale_end = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_visible"]),
            models.Index(fields=["category", "is_visible"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["sku"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def is_on_sale(self) -> bool:
        now = timezone.now()
        return bool(
            self.sale_start
            and self.sale_end
            and self.sale_start <= now <= self.sale_end
        )

    @property
    def current_price(self) -> Decimal:
        return self.price if self.is_on_sale else self.original_price

    @property
    def discount_percentage(self) -> int:
        """Calculate discount percentage."""
        if not self.is_on_sale:
            return 0

        discount = ((self.original_price - self.price) / self.original_price) * 100
        return round(discount)

    @property
    def is_in_stock(self) -> bool:
        """Check if product is in stock."""
        return self.stock_quantity > 0

    @property
    def is_available(self) -> bool:
        """Check if product is available for purchase."""
        return self.is_visible and self.is_in_stock
