from django.contrib import admin
from apps.checkout.models import Shipment


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "courier",
        "shipping_method",
        "shipped_at",
        "delivered_at",
        "is_delivered",
    ]
    list_display_links = ["order"]
    list_filter = ["courier", "shipping_method", "shipped_at", "delivered_at"]
    search_fields = ["order__order_number", "courier__name"]
    ordering = ["-shipped_at"]
    readonly_fields = ["created_at", "updated_at", "is_delivered"]

    fieldsets = (
        (
            "Shipment Information",
            {
                "fields": (
                    "order",
                    "shipping_method",
                    "courier",
                    "shipped_at",
                    "delivered_at",
                )
            },
        ),
        ("Address", {"fields": ("shipping_address",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def is_delivered(self, obj):
        """Show delivery status."""
        return obj.is_delivered

    is_delivered.boolean = True
    is_delivered.short_description = "Delivered"
