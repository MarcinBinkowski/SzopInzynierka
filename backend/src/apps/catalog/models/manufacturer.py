from django.db import models
from django.utils.text import slugify

from apps.common.models import TimestampedModel


class Manufacturer(TimestampedModel):
    """Product manufacturer for organizing products by brand."""

    name = models.CharField(max_length=100, unique=True, help_text="Manufacturer name")
    slug = models.SlugField(
        max_length=100, unique=True, help_text="URL-friendly version of the name"
    )
    description = models.TextField(blank=True, help_text="Manufacturer description")
    website = models.CharField(
        max_length=200, blank=True, help_text="Manufacturer website URL"
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether this manufacturer is visible"
    )

    class Meta:
        verbose_name_plural = "manufacturers"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
