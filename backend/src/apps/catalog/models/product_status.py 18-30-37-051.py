from django.db import models
from apps.common.models import TimestampedModel


class ProductStatus(TimestampedModel):
    """Product status options stored as separate table for flexibility."""
    
    code = models.CharField(max_length=20, unique=True, help_text="Unique status code")
    name = models.CharField(max_length=100, help_text="Display name")
    
    class Meta:
        ordering = ['name']
        verbose_name = "Product Status"
        verbose_name_plural = "Product Statuses"
    
    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
    
    @classmethod
    def get_default_status(cls):
        """Get the default draft status."""
        return cls.objects.filter(code='draft').first() 