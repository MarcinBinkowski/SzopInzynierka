import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profile", "0004_remove_address_profile_add_profile_ae7808_idx_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="RoleAssignment",
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
                    "role",
                    models.CharField(
                        choices=[
                            ("admin", "Admin"),
                            ("reader", "Reader"),
                            ("customer", "Customer"),
                        ],
                        default="customer",
                        help_text="Role assigned to the user",
                        max_length=20,
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Whether this role assignment is currently active",
                    ),
                ),
                (
                    "assigned_by",
                    models.ForeignKey(
                        help_text="User who assigned this role",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="role_assignments_given",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="User assigned to this role",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="role_assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Role Assignment",
                "verbose_name_plural": "Role Assignments",
                "ordering": ["-created_at"],
                "unique_together": {("user", "role")},
            },
        ),
    ]
