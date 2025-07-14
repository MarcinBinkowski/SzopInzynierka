import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("catalog", "0002_manufacturer_product_manufacturer"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Cart",
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
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("converted", "Converted to Order"),
                            ("abandoned", "Abandoned"),
                            ("expired", "Expired"),
                        ],
                        default="active",
                        help_text="Current status of the cart",
                        max_length=20,
                    ),
                ),
                (
                    "notes",
                    models.TextField(
                        blank=True, help_text="Additional notes for the cart"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        help_text="User who owns this cart",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="carts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="CartItem",
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
                        default=1,
                        help_text="Quantity of this product in cart",
                        validators=[django.core.validators.MinValueValidator(1)],
                    ),
                ),
                (
                    "unit_price",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Price per unit when added to cart",
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.01"))
                        ],
                    ),
                ),
                (
                    "cart",
                    models.ForeignKey(
                        help_text="Cart this item belongs to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="checkout.cart",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        help_text="Product in the cart",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="cart_items",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "ordering": ["created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="cart",
            index=models.Index(
                fields=["user", "status"], name="checkout_ca_user_id_c7cb4a_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="cart",
            index=models.Index(
                fields=["status", "created_at"], name="checkout_ca_status_bcbe9e_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="cartitem",
            index=models.Index(
                fields=["cart", "product"], name="checkout_ca_cart_id_e3f0d3_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="cartitem",
            index=models.Index(
                fields=["product", "quantity"], name="checkout_ca_product_f1d9b5_idx"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="cartitem",
            unique_together={("cart", "product")},
        ),
    ]
