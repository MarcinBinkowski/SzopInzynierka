import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0004_shippingmethod_cart_shipping_address_order_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Coupon",
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
                        help_text="Coupon code", max_length=20, unique=True
                    ),
                ),
                ("name", models.CharField(help_text="Display name", max_length=100)),
                ("description", models.TextField(blank=True)),
                (
                    "discount_amount",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Fixed discount amount",
                        max_digits=10,
                    ),
                ),
                (
                    "max_uses",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Maximum total uses (null = unlimited)",
                        null=True,
                    ),
                ),
                (
                    "max_uses_per_user",
                    models.PositiveIntegerField(
                        default=1, help_text="Maximum uses per user"
                    ),
                ),
                ("valid_from", models.DateTimeField()),
                ("valid_until", models.DateTimeField()),
            ],
            options={
                "verbose_name": "Coupon",
                "verbose_name_plural": "Coupons",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddField(
            model_name="cart",
            name="coupon_discount",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0.00"),
                help_text="Discount amount from applied coupon",
                max_digits=10,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="coupon_discount",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0.00"),
                help_text="Discount amount from applied coupon",
                max_digits=10,
            ),
        ),
        migrations.AddField(
            model_name="cart",
            name="applied_coupon",
            field=models.ForeignKey(
                blank=True,
                help_text="Applied coupon to this cart",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="carts",
                to="checkout.coupon",
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="applied_coupon",
            field=models.ForeignKey(
                blank=True,
                help_text="Applied coupon to this order",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="orders",
                to="checkout.coupon",
            ),
        ),
        migrations.CreateModel(
            name="CouponRedemption",
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
                    "discount_amount",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                (
                    "original_total",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                ("final_total", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "coupon",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="redemptions",
                        to="checkout.coupon",
                    ),
                ),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="coupon_redemptions",
                        to="checkout.order",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="coupon_redemptions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Coupon Redemption",
                "verbose_name_plural": "Coupon Redemptions",
                "ordering": ["-created_at"],
                "unique_together": {("user", "coupon", "order")},
            },
        ),
    ]
