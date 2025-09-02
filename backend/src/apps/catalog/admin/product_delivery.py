from django.contrib import admin
from apps.catalog.models import ProductDelivery


@admin.register(ProductDelivery)
class ProductDeliveryAdmin(admin.ModelAdmin):
    list_display = ["product", "supplier", "quantity", "cost_per_unit", "delivery_date"]
    list_display_links = ["product", "supplier"]
    list_filter = ["supplier", "delivery_date", "product__category"]
    search_fields = ["product__name", "supplier__name"]
    ordering = ["-delivery_date"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (
            "Delivery Information",
            {
                "fields": (
                    "supplier",
                    "product",
                    "quantity",
                    "cost_per_unit",
                    "delivery_date",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
