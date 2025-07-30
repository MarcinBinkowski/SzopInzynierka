from django.contrib import admin
from django.utils.html import format_html

from apps.checkout.models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""

    list_display = [
        "id",
        "user_display",
        "amount_display",
        "status",
        "stripe_payment_intent_id",
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
        "stripe_payment_intent_id",
        "description",
    ]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "amount_display",
    ]

    fieldsets = (
        ("Basic Information", {"fields": ("user", "amount", "status", "description")}),
        (
            "Stripe Information",
            {
                "fields": ("stripe_payment_intent_id", "stripe_charge_id", "stripe_customer_id"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("metadata",),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("id", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def user_display(self, obj: Payment) -> str:
        """Display user information."""
        if obj.user:
            return format_html(
                '<a href="/admin/auth/user/{}/">{}</a>',
                obj.user.id,
                obj.user.username,
            )
        return "Anonymous"

    user_display.short_description = "User"

    def amount_display(self, obj: Payment) -> str:
        """Display amount with formatting."""
        return format_html("${:.2f}", obj.amount)

    amount_display.short_description = "Amount" 