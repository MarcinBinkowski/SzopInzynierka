import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_manufacturer_product_manufacturer"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="WishlistItem",
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
                    "product",
                    models.ForeignKey(
                        help_text="Product in the wishlist",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="wishlist_items",
                        to="catalog.product",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="User who added this item to wishlist",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="wishlist_items",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Wishlist Item",
                "verbose_name_plural": "Wishlist Items",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["user", "created_at"],
                        name="catalog_wis_user_id_270836_idx",
                    ),
                    models.Index(
                        fields=["product"], name="catalog_wis_product_3f553d_idx"
                    ),
                ],
                "unique_together": {("user", "product")},
            },
        ),
    ]
