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


class SoftDeleteModel(models.Model):
    """Abstract model for soft delete functionality.

    Provides soft delete capability - records are marked as deleted
    rather than actually removed from the database.
    """

    is_deleted: models.BooleanField = models.BooleanField(
        default=False, help_text="Whether this record has been soft deleted"
    )
    deleted_at: models.DateTimeField = models.DateTimeField(
        null=True, blank=True, help_text="Timestamp when the record was soft deleted"
    )

    class Meta:
        abstract = True

    def soft_delete(self) -> None:
        """Mark this record as deleted without removing it from database."""
        from django.utils import timezone

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])

    def restore(self) -> None:
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=["is_deleted", "deleted_at"])


class TimestampedSoftDeleteModel(TimestampedModel, SoftDeleteModel):
    """Combined timestamped and soft delete model."""

    class Meta:
        abstract = True
