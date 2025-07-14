import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_manufacturer_product_manufacturer"),
        ("checkout", "0003_payment"),
        ("profile", "0003_remove_address_unique_default_address_per_profile"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ShippingMethod",
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
                        help_text="Name of the shipping method (e.g., 'Standard', 'Express')",
                        max_length=100,
                    ),
                ),
                (
                    "price",
                    models.DecimalField(
                        decimal_places=2, help_text="Shipping cost", max_digits=10
                    ),
                ),
            ],
            options={
                "verbose_name": "Shipping Method",
                "verbose_name_plural": "Shipping Methods",
                "ordering": ["price"],
            },
        ),
        migrations.AddField(
            model_name="cart",
            name="shipping_address",
            field=models.ForeignKey(
                blank=True,
                help_text="Selected shipping address for this cart",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="carts",
                to="profile.address",
            ),
        ),
        migrations.CreateModel(
            name="Order",
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
                    "order_number",
                    models.CharField(
                        help_text="Unique order number", max_length=50, unique=True
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("confirmed", "Confirmed"),
                            ("shipped", "Shipped"),
                            ("delivered", "Delivered"),
                            ("cancelled", "Cancelled"),
                        ],
                        default="pending",
                        help_text="Current status of the order",
                        max_length=20,
                    ),
                ),
                (
                    "subtotal",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Subtotal of all items",
                        max_digits=10,
                    ),
                ),
                (
                    "shipping_cost",
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal("0.00"),
                        help_text="Shipping cost",
                        max_digits=10,
                    ),
                ),
                (
                    "total",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Total amount including shipping",
                        max_digits=10,
                    ),
                ),
                (
                    "notes",
                    models.TextField(
                        blank=True, help_text="Additional notes for the order"
                    ),
                ),
                (
                    "payment",
                    models.OneToOneField(
                        blank=True,
                        help_text="Payment associated with this order",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="order",
                        to="checkout.payment",
                    ),
                ),
                (
                    "shipping_address",
                    models.ForeignKey(
                        help_text="Shipping address for this order",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="orders",
                        to="profile.address",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="User who placed this order",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orders",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "shipping_method",
                    models.ForeignKey(
                        help_text="Shipping method used for this order",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="orders",
                        to="checkout.shippingmethod",
                    ),
                ),
            ],
            options={
                "verbose_name": "Order",
                "verbose_name_plural": "Orders",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddField(
            model_name="cart",
            name="shipping_method",
            field=models.ForeignKey(
                blank=True,
                help_text="Selected shipping method for this cart",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="carts",
                to="checkout.shippingmethod",
            ),
        ),
        migrations.CreateModel(
            name="OrderItem",
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
                ("quantity", models.PositiveIntegerField(help_text="Quantity ordered")),
                (
                    "unit_price",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Price per unit at time of order",
                        max_digits=10,
                    ),
                ),
                (
                    "total_price",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Total price for this item (quantity × unit_price)",
                        max_digits=10,
                    ),
                ),
                (
                    "order",
                    models.ForeignKey(
                        help_text="Order this item belongs to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="checkout.order",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        help_text="Product that was ordered",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="order_items",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "verbose_name": "Order Item",
                "verbose_name_plural": "Order Items",
                "ordering": ["created_at"],
                "indexes": [
                    models.Index(
                        fields=["order", "product"],
                        name="checkout_or_order_i_bb7e98_idx",
                    ),
                    models.Index(
                        fields=["product", "quantity"],
                        name="checkout_or_product_0fc5fe_idx",
                    ),
                ],
            },
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(
                fields=["user", "status"], name="checkout_or_user_id_870ae7_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(
                fields=["order_number"], name="checkout_or_order_n_88fdbf_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(
                fields=["status", "created_at"], name="checkout_or_status_aa46d2_idx"
            ),
        ),
    ]
