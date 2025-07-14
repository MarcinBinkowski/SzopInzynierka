from django.contrib.auth import get_user_model
from apps.checkout.models import Order, Invoice, InvoiceTemplate
from apps.checkout.services.invoice_template_service import InvoiceTemplateService

User = get_user_model()


class InvoiceCreationService:
    """Service for automatically creating invoices when orders are completed."""

    @classmethod
    def create_invoice_for_order(cls, order: Order) -> Invoice:
        """
        Create an invoice for a completed order using the default template.

        Args:
            order: The completed order

        Returns:
            Created invoice instance
        """
        default_template = InvoiceTemplate.objects.filter(is_default=True).first()

        if not default_template:
            raise ValueError(
                "No default invoice template found. Please create a default template."
            )

        order.refresh_from_db()

        context = InvoiceTemplateService._build_context(order)

        html_content = InvoiceTemplateService.render_invoice(
            default_template.content, context
        )

        invoice_number = f"INV-{order.order_number}"
        invoice = Invoice.objects.create(
            order=order, invoice_number=invoice_number, html_content=html_content
        )

        return invoice

    @classmethod
    def create_invoice_for_order_if_needed(cls, order: Order) -> Invoice:
        """
        Create an invoice for an order if one doesn't already exist.

        Args:
            order: The order to create invoice for

        Returns:
            Existing or newly created invoice instance
        """
        existing_invoice = getattr(order, "invoice", None)
        if existing_invoice:
            return existing_invoice

        return cls.create_invoice_for_order(order)
