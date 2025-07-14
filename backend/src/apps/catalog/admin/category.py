from django.contrib import admin
from django.db import models
from django.forms import TextInput, Textarea
from django.utils.html import format_html

from apps.catalog.models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model."""

    list_display = [
        "name",
        "slug",
        "is_active",
        "product_count",
        "created_at",
    ]
    list_filter = [
        "is_active",
        "created_at",
        "updated_at",
    ]
    search_fields = [
        "name",
        "description",
    ]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "product_count",
    ]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug", "description")}),
        ("Status", {"fields": ("is_active",)}),
        (
            "Metadata",
            {
                "fields": ("id", "created_at", "updated_at", "product_count"),
                "classes": ("collapse",),
            },
        ),
    )

    formfield_overrides = {
        models.CharField: {"widget": TextInput(attrs={"size": "80"})},
        models.TextField: {"widget": Textarea(attrs={"rows": 4, "cols": 80})},
    }

    def product_count(self, obj: Category) -> str:
        """Display count of products in this category."""
        count = obj.products.count()
        if count > 0:
            return format_html(
                '<a href="/admin/products/product/?category__id__exact={}">{} products</a>',
                obj.id,
                count,
            )
        return "0 products"

    product_count.short_description = "Products"

    def get_queryset(self, request):
        """Optimize queryset with prefetch for product count."""
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("products")
