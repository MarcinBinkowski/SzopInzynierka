from django.contrib import admin
from django.db import models
from django.forms import Textarea
from django.utils.html import format_html

from apps.checkout.models import Cart


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin configuration for Cart model."""

    list_display = [
        "id",
        "user_display",
        "status",
        "item_count_display",
        "subtotal_display",
        "created_at",
    ]
    list_filter = [
        "status",
        "created_at",
        "updated_at",
    ]
    search_fields = [
        "user__username",
        "user__email",
    ]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "item_count_display",
        "subtotal_display",
        "total_display",
    ]

    fieldsets = (
        ("Basic Information", {"fields": ("user", "status")}),
        (
            "Calculated Fields",
            {
                "fields": ("item_count_display", "subtotal_display", "total_display"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("id", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    formfield_overrides = {
        models.TextField: {"widget": Textarea(attrs={"rows": 3, "cols": 80})},
    }

    def user_display(self, obj: Cart) -> str:
        """Display user information."""
        if obj.user:
            return format_html(
                '<a href="/admin/auth/user/{}/">{}</a>',
                obj.user.id,
                obj.user.username,
            )
        return "Anonymous"

    user_display.short_description = "User"

    def item_count_display(self, obj: Cart) -> str:
        """Display item count with link to items."""
        count = obj.item_count
        if count > 0:
            return format_html(
                '<a href="/admin/checkout/cartitem/?cart__id__exact={}">{} items</a>',
                obj.id,
                count,
            )
        return "0 items"

    item_count_display.short_description = "Items"

    def subtotal_display(self, obj: Cart) -> str:
        """Display subtotal with formatting."""
        return format_html("${:.2f}", obj.subtotal)

    subtotal_display.short_description = "Subtotal"

    def total_display(self, obj: Cart) -> str:
        """Display total with formatting."""
        return format_html("${:.2f}", obj.total)

    total_display.short_description = "Total"

    def get_queryset(self, request):
        """Optimize queryset with prefetch for item count."""
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("items")
