from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import TimestampedModel

User = get_user_model()


class Invoice(TimestampedModel):
    """Generated invoices from templates."""

    order = models.OneToOneField(
        "Order",
        on_delete=models.CASCADE,
        related_name="invoice",
        help_text="Order this invoice is for",
    )
    invoice_number = models.CharField(
        max_length=50, unique=True, help_text="Unique invoice number"
    )
    html_content = models.TextField(help_text="Rendered HTML content of the invoice")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self) -> str:
        return f"Invoice {self.invoice_number} for Order {self.order.order_number}"
