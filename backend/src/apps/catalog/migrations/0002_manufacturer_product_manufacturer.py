import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Manufacturer",
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
                        help_text="Manufacturer name", max_length=100, unique=True
                    ),
                ),
                (
                    "slug",
                    models.SlugField(
                        help_text="URL-friendly version of the name",
                        max_length=100,
                        unique=True,
                    ),
                ),
                (
                    "description",
                    models.TextField(blank=True, help_text="Manufacturer description"),
                ),
                (
                    "website",
                    models.URLField(blank=True, help_text="Manufacturer website URL"),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True, help_text="Whether this manufacturer is visible"
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "manufacturers",
                "ordering": ["name"],
            },
        ),
        migrations.AddField(
            model_name="product",
            name="manufacturer",
            field=models.ForeignKey(
                blank=True,
                help_text="Product manufacturer",
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="products",
                to="catalog.manufacturer",
            ),
        ),
    ]
