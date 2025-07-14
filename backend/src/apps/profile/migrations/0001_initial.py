import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Profile",
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
                    "first_name",
                    models.CharField(
                        blank=True, help_text="User's first name", max_length=150
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, help_text="User's last name", max_length=150
                    ),
                ),
                (
                    "date_of_birth",
                    models.DateField(
                        blank=True,
                        help_text="User's date of birth (optional)",
                        null=True,
                    ),
                ),
                (
                    "phone_number",
                    models.CharField(
                        blank=True,
                        help_text="Primary phone number with country code",
                        max_length=20,
                    ),
                ),
                (
                    "profile_completed",
                    models.BooleanField(
                        default=False,
                        help_text="Whether profile has all required information for checkout",
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        help_text="Associated user account",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "User Profile",
                "verbose_name_plural": "User Profiles",
                "ordering": ["-created_at"],
            },
        ),
    ]
