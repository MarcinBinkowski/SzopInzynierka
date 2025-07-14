from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class TimestampedModel(models.Model):
    """Abstract base model that provides timestamp fields."""

    created_at: models.DateTimeField = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when the record was created"
    )
    updated_at: models.DateTimeField = models.DateTimeField(
        auto_now=True, help_text="Timestamp when the record was last updated"
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]
