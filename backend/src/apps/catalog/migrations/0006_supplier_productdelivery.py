import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0005_remove_notificationpreference_push_token"),
    ]

    operations = [
        migrations.CreateModel(
            name="Supplier",
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
                    models.CharField(help_text="Supplier company name", max_length=100),
                ),
                (
                    "contact_email",
                    models.EmailField(
                        blank=True, help_text="Primary contact email", max_length=254
                    ),
                ),
                (
                    "phone",
                    models.CharField(
                        blank=True, help_text="Contact phone number", max_length=20
                    ),
                ),
            ],
            options={
                "verbose_name": "Supplier",
                "verbose_name_plural": "Suppliers",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="ProductDelivery",
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
                    "quantity",
                    models.PositiveIntegerField(
                        help_text="Quantity of products delivered",
                        validators=[django.core.validators.MinValueValidator(1)],
                    ),
                ),
                (
                    "delivery_date",
                    models.DateTimeField(help_text="When the delivery was received"),
                ),
                (
                    "cost_per_unit",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Cost per unit for this delivery",
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.01"))
                        ],
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        help_text="Product that was delivered",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="deliveries",
                        to="catalog.product",
                    ),
                ),
                (
                    "supplier",
                    models.ForeignKey(
                        help_text="Supplier who delivered the products",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="deliveries",
                        to="catalog.supplier",
                    ),
                ),
            ],
            options={
                "verbose_name": "Product Delivery",
                "verbose_name_plural": "Product Deliveries",
                "ordering": ["-delivery_date"],
            },
        ),
    ]
