from django.db import models
from django.utils.text import slugify

from apps.common.models import TimestampedModel


class Category(TimestampedModel):
    """Product category for organizing products."""

    name = models.CharField(max_length=100, unique=True, help_text="Category name")
    slug = models.SlugField(
        max_length=100, unique=True, help_text="URL-friendly version of the name"
    )
    description = models.TextField(blank=True, help_text="Category description")
    is_active = models.BooleanField(
        default=True, help_text="Whether this category is visible"
    )

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
