from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Country",
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
                        db_index=True,
                        help_text="alpha-2 country code (e.g., PL, US, GB)",
                        max_length=2,
                        unique=True,
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Official country name in English", max_length=100
                    ),
                ),
            ],
            options={
                "verbose_name": "Country",
                "verbose_name_plural": "Countries",
                "ordering": ["name"],
                "indexes": [
                    models.Index(fields=["code"], name="geographic__code_dd8846_idx"),
                    models.Index(fields=["name"], name="geographic__name_29b9b3_idx"),
                ],
            },
        ),
    ]
