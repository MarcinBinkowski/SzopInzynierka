from django.contrib import admin
from apps.catalog.models import ProductStatus


@admin.register(ProductStatus)
class ProductStatusAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "created_at"]
    list_display_links = ["code", "name"]
    search_fields = ["code", "name"]
    ordering = ["name"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("code", "name")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
