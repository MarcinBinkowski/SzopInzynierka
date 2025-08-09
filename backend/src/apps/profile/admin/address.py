from django.contrib import admin
from apps.profile.models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Django admin configuration for Address model."""

    list_display = [
        "profile",
        "address",
        "city",
        "country",
        "is_default",
        "label",
        "created_at",
    ]

    list_filter = [
        "country",
        "is_default",
        "created_at",
    ]

    search_fields = [
        "profile__user__email",
        "profile__first_name",
        "profile__last_name",
        "address",
        "city",
        "label",
    ]

    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Profile Information", {"fields": ("profile",)}),
        (
            "Address Information",
            {
                "fields": (
                    "address",
                    "city",
                    "postal_code",
                    "country",
                    "label",
                )
            },
        ),
        ("Settings", {"fields": ("is_default",)}),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    # Optimize database queries in admin
    def get_queryset(self, request):
        """Optimize queryset with select_related for profile, user and country."""
        return super().get_queryset(request).select_related("profile__user", "country")
