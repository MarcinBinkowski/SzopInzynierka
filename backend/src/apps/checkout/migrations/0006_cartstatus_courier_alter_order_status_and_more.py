import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0005_coupon_cart_coupon_discount_order_coupon_discount_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CartStatus",
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
                    "code",
                    models.CharField(
                        help_text="Unique cart status code", max_length=20, unique=True
                    ),
                ),
                ("name", models.CharField(help_text="Display name", max_length=100)),
            ],
            options={
                "verbose_name": "Cart Status",
                "verbose_name_plural": "Cart Statuses",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Courier",
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
                    models.CharField(help_text="Courier company name", max_length=100),
                ),
            ],
            options={
                "verbose_name": "Courier",
                "verbose_name_plural": "Couriers",
                "ordering": ["name"],
            },
        ),
        migrations.AlterField(
            model_name="order",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("confirmed", "Confirmed"),
                    ("shipped", "Shipped"),
                    ("delivered", "Delivered"),
                ],
                default="pending",
                help_text="Current status of the order",
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name="OrderProcessingNote",
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
                ("note", models.TextField(help_text="Note content")),
                (
                    "order",
                    models.ForeignKey(
                        help_text="Order this note relates to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="processing_notes",
                        to="checkout.order",
                    ),
                ),
                (
                    "staff_member",
                    models.ForeignKey(
                        help_text="Staff member who created this note",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="order_notes",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Order Processing Note",
                "verbose_name_plural": "Order Processing Notes",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Shipment",
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
                    "shipped_at",
                    models.DateTimeField(help_text="When the package was shipped"),
                ),
                (
                    "delivered_at",
                    models.DateTimeField(
                        blank=True,
                        help_text="When the package was delivered",
                        null=True,
                    ),
                ),
                (
                    "shipping_address",
                    models.TextField(help_text="Shipping address at time of shipment"),
                ),
                (
                    "courier",
                    models.ForeignKey(
                        help_text="Courier company handling the shipment",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="shipments",
                        to="checkout.courier",
                    ),
                ),
                (
                    "order",
                    models.OneToOneField(
                        help_text="Order this shipment is for",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shipment",
                        to="checkout.order",
                    ),
                ),
                (
                    "shipping_method",
                    models.ForeignKey(
                        help_text="Shipping method used",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="shipments",
                        to="checkout.shippingmethod",
                    ),
                ),
            ],
            options={
                "verbose_name": "Shipment",
                "verbose_name_plural": "Shipments",
                "ordering": ["-shipped_at"],
            },
        ),
    ]
