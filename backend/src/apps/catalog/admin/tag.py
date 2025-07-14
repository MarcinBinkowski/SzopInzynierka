from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.utils.html import format_html

from apps.catalog.models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin configuration for Tag model."""

    list_display = [
        "name",
        "slug",
        "product_count",
        "created_at",
    ]
    search_fields = [
        "name",
    ]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "product_count",
    ]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug")}),
        (
            "Metadata",
            {
                "fields": ("id", "created_at", "updated_at", "product_count"),
                "classes": ("collapse",),
            },
        ),
    )

    formfield_overrides = {
        models.CharField: {"widget": TextInput(attrs={"size": "50"})},
    }

    def product_count(self, obj: Tag) -> str:
        """Display count of products with this tag."""
        count = obj.product_set.count()
        if count > 0:
            return format_html(
                '<a href="/admin/products/product/?tags__id__exact={}">{} products</a>',
                obj.id,
                count,
            )
        return "0 products"

    product_count.short_description = "Products"

    def get_queryset(self, request):
        """Optimize queryset with prefetch for product count."""
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("product_set")
