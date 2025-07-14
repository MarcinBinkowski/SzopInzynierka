from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from apps.checkout.models import Order, Shipment

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def create_shipment_on_order_creation(sender, instance, created, **kwargs):
    """
    Automatically create a shipment when a new order is created.
    """
    if not created:
        return

    try:
        Shipment.objects.create(
            order=instance,
            shipping_address=str(instance.shipping_address),
        )
        logger.info(f"Automatically created shipment for order {instance.order_number}")
    except Exception as e:
        logger.error(
            f"Failed to create shipment for order {instance.order_number}: {str(e)}"
        )
