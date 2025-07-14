from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from apps.profile.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin interface for Profile model with comprehensive functionality."""

    list_display = [
        "user_email",
        "display_name",
        "phone_number",
        "age_display",
        "profile_completed",
        "checkout_ready_status",
        "addresses_count",
        "created_at",
    ]

    list_filter = [
        "profile_completed",
        "created_at",
        "updated_at",
        ("date_of_birth", admin.EmptyFieldListFilter),
        ("phone_number", admin.EmptyFieldListFilter),
    ]

    search_fields = [
        "user__email",
        "user__username",
        "first_name",
        "last_name",
        "phone_number",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
        "missing_fields_display",
        "user_info_display",
        "addresses_summary",
    ]

    fieldsets = (
        (
            "User Account",
            {
                "fields": ("user", "user_info_display"),
                "description": "Associated user account information",
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "date_of_birth",
                    "phone_number",
                ),
                "description": "Personal details for checkout and contact",
            },
        ),
        (
            "Profile Status",
            {
                "fields": (
                    "profile_completed",
                    "missing_fields_display",
                ),
                "description": "Profile completion and checkout readiness status",
            },
        ),
        (
            "Address Information",
            {
                "fields": ("addresses_summary",),
                "description": "Summary of user's addresses",
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    actions = [
        "mark_as_completed",
        "mark_as_incomplete",
        "update_completion_status",
    ]

    def user_email(self, obj: Profile) -> str:
        """Display user's email with link to user admin."""
        user_url = reverse("admin:auth_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', user_url, obj.user.email)

    user_email.short_description = "User Email"
    user_email.admin_order_field = "user__email"

    def display_name(self, obj: Profile) -> str:
        """Display user's full name or fallback."""
        return obj.get_display_name()

    display_name.short_description = "Display Name"

    def age_display(self, obj: Profile) -> str:
        """Display user's age or 'Not provided'."""
        age = obj.get_age()
        return f"{age} years" if age is not None else "Not provided"

    age_display.short_description = "Age"

    def checkout_ready_status(self, obj: Profile) -> bool:
        """Display checkout readiness as boolean icon."""
        return obj.is_checkout_ready()

    checkout_ready_status.boolean = True
    checkout_ready_status.short_description = "Checkout Ready"

    def addresses_count(self, obj: Profile) -> int:
        """Display count of profile's addresses."""
        return obj.addresses.count()

    addresses_count.short_description = "Addresses"

    def missing_fields_display(self, obj: Profile) -> str:
        """Display missing fields in a formatted list."""
        missing_fields = obj.get_missing_checkout_fields()

        if not missing_fields:
            return format_html(
                '<span style="color: green;">All required fields complete</span>'
            )

        fields_html = "<br>".join([f"• {field}" for field in missing_fields])
        return format_html(
            '<div style="color: red;"><strong>Missing fields:</strong><br>{}</div>',
            mark_safe(fields_html),
        )

    missing_fields_display.short_description = "Missing Fields"

    def user_info_display(self, obj: Profile) -> str:
        """Display comprehensive user information."""
        user = obj.user
        info_parts = [
            f"<strong>Username:</strong> {user.username}",
            f"<strong>Email:</strong> {user.email}",
            f"<strong>Joined:</strong> {user.date_joined.strftime('%Y-%m-%d')}",
            f"<strong>Active:</strong> {'Yes' if user.is_active else 'No'}",
            f"<strong>Staff:</strong> {'Yes' if user.is_staff else 'No'}",
        ]

        return format_html("<br>".join(info_parts))

    user_info_display.short_description = "User Information"

    def addresses_summary(self, obj: Profile) -> str:
        """Display summary of profile's addresses."""
        addresses = obj.addresses.all()

        if not addresses:
            return format_html(
                '<span style="color: orange;">No addresses configured</span>'
            )

        summary_parts = []
        for address in addresses:
            address_type = address.get_address_type_display()
            default_indicator = " (Default)" if address.is_default else ""
            city_country = f"{address.city}, {address.country.name}"

            summary_parts.append(
                f"<strong>{address_type}{default_indicator}:</strong> {city_country}"
            )

        return format_html("<br>".join(summary_parts))

    addresses_summary.short_description = "Addresses Summary"

    # Custom admin actions
    def mark_as_completed(self, request, queryset):
        """Mark selected profiles as completed."""
        updated = queryset.update(profile_completed=True)
        self.message_user(
            request, f"Successfully marked {updated} profile(s) as completed."
        )

    mark_as_completed.short_description = "Mark selected profiles as completed"

    def mark_as_incomplete(self, request, queryset):
        """Mark selected profiles as incomplete."""
        updated = queryset.update(profile_completed=False)
        self.message_user(
            request, f"Successfully marked {updated} profile(s) as incomplete."
        )

    mark_as_incomplete.short_description = "Mark selected profiles as incomplete"

    def update_completion_status(self, request, queryset):
        """Update completion status based on actual data."""
        updated_count = 0
        for profile in queryset:
            old_status = profile.profile_completed
            profile.update_completion_status()
            if old_status != profile.profile_completed:
                updated_count += 1

        self.message_user(
            request, f"Updated completion status for {updated_count} profile(s)."
        )

    update_completion_status.short_description = (
        "Update completion status based on data"
    )

    def save_model(self, request, obj: Profile, form, change: bool) -> None:
        """Override save to update completion status after saving."""
        super().save_model(request, obj, form, change)
        obj.update_completion_status()

    def get_readonly_fields(self, request, obj: Profile | None = None):
        """Dynamically adjust readonly fields based on permissions."""
        readonly = list(self.readonly_fields)

        # Make user field readonly when editing existing profile
        if obj and not request.user.is_superuser:
            readonly.append("user")

        return readonly

    def has_delete_permission(self, request, obj: Profile | None = None) -> bool:
        """Only superusers can delete profiles."""
        return request.user.is_superuser

    def get_form(self, request, obj: Profile | None = None, **kwargs):
        """Customize the form based on user permissions."""
        form = super().get_form(request, obj, **kwargs)

        # Limit user selection to users without profiles when creating
        if not obj and "user" in form.base_fields:
            from django.contrib.auth import get_user_model

            User = get_user_model()

            # Only show users who don't have profiles yet
            users_without_profiles = User.objects.filter(profile__isnull=True)
            form.base_fields["user"].queryset = users_without_profiles

        return form
