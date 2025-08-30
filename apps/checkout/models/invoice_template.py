from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import TimestampedModel

User = get_user_model()

class InvoiceTemplate(TimestampedModel):
    """Invoice templates with Jinja2 syntax for customization."""
    
    name = models.CharField(max_length=100, help_text="Template name (e.g., 'Standard Invoice')")
    content = models.TextField(help_text="Jinja2 template content with HTML")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_templates',
        help_text="User who created this template"
    )
    
    class Meta:
        ordering = ['name']
        unique_together = ['name']
        verbose_name = "Invoice Template"
        verbose_name_plural = "Invoice Templates"
    
    def __str__(self) -> str:
        return self.name 