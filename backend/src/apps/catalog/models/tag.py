from django.db import models
from django.utils.text import slugify

from apps.common.models import TimestampedModel


class Tag(TimestampedModel):
    """Tags for categorizing and filtering products."""

    name = models.CharField(max_length=50, unique=True, help_text="Tag name")
    slug = models.SlugField(
        max_length=50, unique=True, help_text="URL-friendly version of the name"
    )

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
