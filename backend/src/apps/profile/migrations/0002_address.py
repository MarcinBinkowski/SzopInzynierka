import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("geographic", "0001_initial"),
        ("profile", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Address",
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
                    "address",
                    models.CharField(
                        help_text="Street address, apartment, unit, etc.",
                        max_length=255,
                    ),
                ),
                ("city", models.CharField(help_text="City name", max_length=100)),
                (
                    "postal_code",
                    models.CharField(
                        help_text="ZIP code or postal code", max_length=20
                    ),
                ),
                (
                    "address_type",
                    models.CharField(
                        choices=[("shipping", "Shipping"), ("billing", "Billing")],
                        help_text="Type of address (shipping or billing)",
                        max_length=20,
                    ),
                ),
                (
                    "is_default",
                    models.BooleanField(
                        default=False,
                        help_text="Whether this is the default address for this type",
                    ),
                ),
                (
                    "label",
                    models.CharField(
                        blank=True,
                        help_text="Optional label like 'Home', 'Office', etc.",
                        max_length=50,
                    ),
                ),
                (
                    "country",
                    models.ForeignKey(
                        help_text="Country for this address",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="addresses",
                        to="geographic.country",
                    ),
                ),
                (
                    "profile",
                    models.ForeignKey(
                        help_text="Profile who owns this address",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="addresses",
                        to="profile.profile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Address",
                "verbose_name_plural": "Addresses",
                "ordering": ["-is_default", "-created_at"],
                "indexes": [
                    models.Index(
                        fields=["profile", "address_type"],
                        name="profile_add_profile_ae7808_idx",
                    ),
                    models.Index(
                        fields=["profile", "is_default"],
                        name="profile_add_profile_2c00c3_idx",
                    ),
                    models.Index(
                        fields=["country"], name="profile_add_country_5794d3_idx"
                    ),
                ],
                "constraints": [
                    models.UniqueConstraint(
                        condition=models.Q(("is_default", True)),
                        fields=("profile", "address_type"),
                        name="unique_default_address_per_profile",
                    )
                ],
            },
        ),
    ]
