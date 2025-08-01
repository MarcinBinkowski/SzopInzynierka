from django.db import models
from django.conf import settings
from src.apps.common.models import TimestampedModel

class Payment(TimestampedModel):
    """
    Model representing a payment transaction.
    """
    
    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELED = "canceled", "Canceled"
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        help_text="Current status of the payment"
    )
    
    # Stripe-specific fields
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # User reference (adjust based on your User model)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.amount} {self.currency} - {self.status}"
    
    @property
    def amount_cents(self):
        """Convert amount to cents for Stripe"""
        return int(self.amount * 100)

