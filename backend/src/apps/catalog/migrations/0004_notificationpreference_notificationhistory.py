import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0003_wishlistitem"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="NotificationPreference",
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
                    "push_token",
                    models.CharField(
                        blank=True,
                        help_text="Expo push notification token",
                        max_length=255,
                        null=True,
                    ),
                ),
                (
                    "stock_alerts_enabled",
                    models.BooleanField(
                        default=False,
                        help_text="Receive alerts when out-of-stock wishlist items become available",
                    ),
                ),
                (
                    "price_drop_alerts_enabled",
                    models.BooleanField(
                        default=False,
                        help_text="Receive alerts when wishlist items go on sale",
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        help_text="User who owns these preferences",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notification_preference",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Notification Preference",
                "verbose_name_plural": "Notification Preferences",
            },
        ),
        migrations.CreateModel(
            name="NotificationHistory",
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
                    "notification_type",
                    models.CharField(
                        choices=[
                            ("stock_available", "Stock Available"),
                            ("price_drop", "Price Drop"),
                        ],
                        help_text="Type of notification sent",
                        max_length=20,
                    ),
                ),
                (
                    "title",
                    models.CharField(help_text="Notification title", max_length=255),
                ),
                ("body", models.TextField(help_text="Notification body text")),
                (
                    "product",
                    models.ForeignKey(
                        help_text="Product the notification was about",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notification_history",
                        to="catalog.product",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="User who received notification",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notification_history",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Notification History",
                "verbose_name_plural": "Notification History",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["user", "created_at"],
                        name="catalog_not_user_id_fb9608_idx",
                    ),
                    models.Index(
                        fields=["product", "notification_type"],
                        name="catalog_not_product_54859c_idx",
                    ),
                ],
            },
        ),
    ]
