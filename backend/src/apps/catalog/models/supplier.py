from django.db import models
from apps.common.models import TimestampedModel


class Supplier(TimestampedModel):
    """Product suppliers/vendors."""

    name = models.CharField(max_length=100, help_text="Supplier company name")
    contact_email = models.EmailField(blank=True, help_text="Primary contact email")
    phone = models.CharField(
        max_length=20, blank=True, help_text="Contact phone number"
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Supplier"
        verbose_name_plural = "Suppliers"

    def __str__(self) -> str:
        return self.name
