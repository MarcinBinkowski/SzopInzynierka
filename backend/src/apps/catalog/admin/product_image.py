from django.contrib import admin
from django.utils.html import format_html

from apps.catalog.models import ProductImage


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin configuration for ProductImage model."""

    list_display = [
        "product",
        "image_preview",
        "alt_text",
        "is_primary",
        "sort_order",
        "created_at",
    ]
    list_filter = [
        "is_primary",
        "created_at",
        "product__category",
    ]
    search_fields = [
        "product__name",
        "alt_text",
    ]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "image_preview_large",
    ]

    fieldsets = (
        (
            "Image Information",
            {"fields": ("product", "image", "image_preview_large", "alt_text")},
        ),
        ("Display Settings", {"fields": ("is_primary", "sort_order")}),
        (
            "Metadata",
            {
                "fields": ("id", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def image_preview(self, obj: ProductImage) -> str:
        """Display small preview of the image in list view."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"

    def image_preview_large(self, obj: ProductImage) -> str:
        """Display larger preview in detail view."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 200px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview_large.short_description = "Image Preview"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        return queryset.select_related("product")
