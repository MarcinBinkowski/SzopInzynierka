from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import TimestampedModel

User = get_user_model()


class InvoiceTemplate(TimestampedModel):
    """Invoice templates with Jinja2 syntax for customization."""

    name = models.CharField(
        max_length=100, help_text="Template name (e.g., 'Standard Invoice')"
    )
    content = models.TextField(help_text="Jinja2 template content with HTML")
    is_default = models.BooleanField(
        default=False,
        help_text="Use as default template for automatic invoice generation",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_templates",
        help_text="User who created this template",
    )

    class Meta:
        ordering = ["name"]
        unique_together = ["name"]
        verbose_name = "Invoice Template"
        verbose_name_plural = "Invoice Templates"
        constraints = [
            models.UniqueConstraint(
                fields=["is_default"],
                condition=models.Q(is_default=True),
                name="unique_default_template",
            )
        ]

    def __str__(self) -> str:
        return self.name
