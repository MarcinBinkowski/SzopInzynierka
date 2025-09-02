from django.contrib import admin
from apps.checkout.models import OrderProcessingNote


@admin.register(OrderProcessingNote)
class OrderProcessingNoteAdmin(admin.ModelAdmin):
    list_display = ["order", "staff_member", "note_preview", "created_at"]
    list_display_links = ["order", "staff_member"]
    list_filter = ["staff_member", "created_at"]
    search_fields = ["order__order_number", "staff_member__username", "note"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Note Information", {"fields": ("order", "staff_member", "note")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def note_preview(self, obj):
        """Show first 50 characters of note."""
        return obj.note[:50] + "..." if len(obj.note) > 50 else obj.note

    note_preview.short_description = "Note Preview"
