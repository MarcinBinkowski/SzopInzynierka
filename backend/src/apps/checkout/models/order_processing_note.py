from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import TimestampedModel

User = get_user_model()


class OrderProcessingNote(TimestampedModel):
    """Staff notes and communication about order processing."""

    order = models.ForeignKey(
        "Order",
        on_delete=models.CASCADE,
        related_name="processing_notes",
        help_text="Order this note relates to",
    )
    staff_member = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="order_notes",
        help_text="Staff member who created this note",
    )
    note = models.TextField(help_text="Note content")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Order Processing Note"
        verbose_name_plural = "Order Processing Notes"

    def __str__(self) -> str:
        return (
            f"Note on Order {self.order.order_number} by {self.staff_member.username}"
        )
