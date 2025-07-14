from django.db import models

from apps.common.models import TimestampedModel
from apps.catalog.models.product import Product


class ProductImage(TimestampedModel):
    """Product images with ordering support."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        help_text="Associated product",
    )
    image = models.ImageField(upload_to="", help_text="Product image")
    is_primary = models.BooleanField(
        default=False, help_text="Whether this is the primary product image"
    )
    sort_order = models.PositiveIntegerField(
        default=0, help_text="Display order of images"
    )

    class Meta:
        ordering = ["product", "sort_order", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=models.Q(is_primary=True),
                name="unique_primary_image_per_product",
            )
        ]

    def __str__(self) -> str:
        return f"{self.product.name} - Image {self.sort_order}"

    def save(self, *args, **kwargs) -> None:
        """Ensure only one primary image per product."""
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(
                pk=self.pk
            ).update(is_primary=False)

        super().save(*args, **kwargs)
