from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
import logging

from apps.checkout.models import Order
from apps.checkout.services.invoice_creation_service import InvoiceCreationService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def create_invoice_on_order_creation(sender, instance, created, **kwargs):
    """
    Automatically create an invoice when a new order is created.
    Only creates invoice for confirmed orders.
    """
    if not created:
        return
    try:
        invoice = InvoiceCreationService.create_invoice_for_order(instance)
        logger.info(f"Automatically created invoice {invoice.invoice_number} for order {instance.order_number}")
    except Exception as e:
        logger.error(f"Failed to create invoice for order {instance.order_number}: {str(e)}")