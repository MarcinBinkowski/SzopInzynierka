import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Category",
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
                        help_text="Category name", max_length=100, unique=True
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
                    models.TextField(blank=True, help_text="Category description"),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True, help_text="Whether this category is visible"
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "categories",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Tag",
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
                    models.CharField(help_text="Tag name", max_length=50, unique=True),
                ),
                (
                    "slug",
                    models.SlugField(
                        help_text="URL-friendly version of the name", unique=True
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Product",
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
                ("name", models.CharField(help_text="Product name", max_length=200)),
                (
                    "slug",
                    models.SlugField(
                        help_text="URL-friendly version of the name",
                        max_length=200,
                        unique=True,
                    ),
                ),
                (
                    "description",
                    models.TextField(help_text="Detailed product description"),
                ),
                (
                    "short_description",
                    models.CharField(
                        blank=True,
                        help_text="Short description for listings",
                        max_length=500,
                    ),
                ),
                (
                    "price",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Product price",
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.01"))
                        ],
                    ),
                ),
                (
                    "original_price",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Original price for showing discounts",
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.01"))
                        ],
                    ),
                ),
                (
                    "sku",
                    models.CharField(
                        help_text="Unique product identifier",
                        max_length=100,
                        unique=True,
                    ),
                ),
                (
                    "stock_quantity",
                    models.PositiveIntegerField(
                        default=0, help_text="Available quantity in stock"
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("active", "Active"),
                            ("inactive", "Inactive"),
                            ("out_of_stock", "Out of Stock"),
                        ],
                        default="draft",
                        help_text="Product status",
                        max_length=20,
                    ),
                ),
                (
                    "is_visible",
                    models.BooleanField(
                        default=False, help_text="Is product visible to the users"
                    ),
                ),
                ("sale_start", models.DateTimeField(blank=True, null=True)),
                ("sale_end", models.DateTimeField(blank=True, null=True)),
                (
                    "category",
                    models.ForeignKey(
                        help_text="Product category",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="products",
                        to="catalog.category",
                    ),
                ),
                (
                    "tags",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Tags for filtering and search",
                        to="catalog.tag",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ProductImage",
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
                    "image",
                    models.ImageField(
                        help_text="Product image", upload_to="products/images/"
                    ),
                ),
                (
                    "alt_text",
                    models.CharField(
                        blank=True,
                        help_text="Alternative text for the image",
                        max_length=255,
                    ),
                ),
                (
                    "is_primary",
                    models.BooleanField(
                        default=False,
                        help_text="Whether this is the primary product image",
                    ),
                ),
                (
                    "sort_order",
                    models.PositiveIntegerField(
                        default=0, help_text="Display order of images"
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        help_text="Associated product",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "ordering": ["product", "sort_order", "created_at"],
                "constraints": [
                    models.UniqueConstraint(
                        condition=models.Q(("is_primary", True)),
                        fields=("product",),
                        name="unique_primary_image_per_product",
                    )
                ],
            },
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["status", "is_visible"], name="catalog_pro_status_1a8990_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["category", "status"], name="catalog_pro_categor_da0f0a_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["slug"], name="catalog_pro_slug_2b1eb6_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["sku"], name="catalog_pro_sku_2c4c34_idx"),
        ),
    ]
