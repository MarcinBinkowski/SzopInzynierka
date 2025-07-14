import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0009_create_shipment_triggers"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="InvoiceTemplate",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Timestamp when the record was created",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Timestamp when the record was last updated",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Template name (e.g., 'Standard Invoice')",
                        max_length=100,
                    ),
                ),
                (
                    "content",
                    models.TextField(help_text="Jinja2 template content with HTML"),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        help_text="User who created this template",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_templates",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Invoice Template",
                "verbose_name_plural": "Invoice Templates",
                "ordering": ["name"],
                "unique_together": {("name",)},
            },
        ),
        migrations.CreateModel(
            name="Invoice",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Timestamp when the record was created",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Timestamp when the record was last updated",
                    ),
                ),
                (
                    "invoice_number",
                    models.CharField(
                        help_text="Unique invoice number", max_length=50, unique=True
                    ),
                ),
                (
                    "generated_by",
                    models.ForeignKey(
                        help_text="User who generated this invoice",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="generated_invoices",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "order",
                    models.OneToOneField(
                        help_text="Order this invoice is for",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="invoice",
                        to="checkout.order",
                    ),
                ),
                (
                    "template",
                    models.ForeignKey(
                        help_text="Template used to generate this invoice",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="generated_invoices",
                        to="checkout.invoicetemplate",
                    ),
                ),
            ],
            options={
                "verbose_name": "Invoice",
                "verbose_name_plural": "Invoices",
                "ordering": ["-created_at"],
            },
        ),
    ]
