from django.db import models
from django.conf import settings
from django.forms import ValidationError

from apps.common.models import TimestampedModel


class Profile(TimestampedModel):
    """Extended user profile with personal information."""

    # User relationship
    user: models.OneToOneField = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        help_text="Associated user account",
    )

    # Personal Information
    first_name: models.CharField = models.CharField(
        max_length=150,
        blank=True,
        help_text="User's first name",
    )
    last_name: models.CharField = models.CharField(
        max_length=150,
        blank=True,
        help_text="User's last name",
    )
    date_of_birth: models.DateField = models.DateField(
        null=True, blank=True, help_text="User's date of birth (optional)"
    )
    phone_number: models.CharField = models.CharField(
        max_length=20, blank=True, help_text="Primary phone number with country code"
    )

    # Profile completion status
    profile_completed: models.BooleanField = models.BooleanField(
        default=False,
        help_text="Whether profile has all required information for checkout",
    )

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        """String representation of the profile."""
        display_name = self.get_display_name()
        return f"{display_name}'s profile"

    def get_display_name(self) -> str:
        """Get user's display name for UI purposes.

        Returns the full name if available, otherwise falls back to email.
        """
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        return self.user.email

    def get_full_name(self) -> str:
        """Get user's full name or empty string."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return ""

    def get_age(self) -> int | None:
        """Calculate age from date of birth."""
        if not self.date_of_birth:
            return None

        from datetime import date

        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )

    def get_default_shipping_address(self):
        """Get user's default shipping address."""
        from apps.profile.models import Address

        return Address.get_shipping_address_for_profile(self)

    def get_default_billing_address(self):
        """Get user's default billing address."""
        from apps.profile.models import Address

        return Address.get_billing_address_for_profile(self)

    def is_checkout_ready(self) -> bool:
        """Check if profile has all required information for checkout."""
        # Check personal information
        personal_info_complete = all(
            [
                self.first_name.strip() if self.first_name else False,
                self.last_name.strip() if self.last_name else False,
                self.phone_number.strip() if self.phone_number else False,
            ]
        )

        # Check if default addresses exist and are complete
        shipping_address = self.get_default_shipping_address()
        billing_address = self.get_default_billing_address()

        return (
            personal_info_complete
            and shipping_address is not None
            and shipping_address.is_complete()
            and billing_address is not None
            and billing_address.is_complete()
        )

    def get_missing_checkout_fields(self) -> list[str]:
        """Get list of fields required to complete checkout."""
        missing_fields: list[str] = []

        # Check personal information fields
        if not (self.first_name and self.first_name.strip()):
            missing_fields.append("First Name")
        if not (self.last_name and self.last_name.strip()):
            missing_fields.append("Last Name")
        if not (self.phone_number and self.phone_number.strip()):
            missing_fields.append("Phone Number")

        # Check shipping address
        shipping_address = self.get_default_shipping_address()
        if not shipping_address:
            missing_fields.append("Shipping Address")
        elif not shipping_address.is_complete():
            missing_fields.append("Complete Shipping Address")

        # Check billing address
        billing_address = self.get_default_billing_address()
        if not billing_address:
            missing_fields.append("Billing Address")
        elif not billing_address.is_complete():
            missing_fields.append("Complete Billing Address")

        return missing_fields

    def get_shipping_address_dict(self) -> dict[str, str] | None:
        """Get shipping address as a dictionary for APIs or templates."""
        shipping_address = self.get_default_shipping_address()
        return shipping_address.get_address_dict() if shipping_address else None

    def get_billing_address_dict(self) -> dict[str, str] | None:
        """Get billing address as a dictionary."""
        billing_address = self.get_default_billing_address()
        return billing_address.get_address_dict() if billing_address else None

    def update_completion_status(self) -> None:
        """Update profile completion status based on current data."""
        current_status = self.profile_completed
        new_status = self.is_checkout_ready()

        if current_status != new_status:
            self.profile_completed = new_status
            self.save(update_fields=["profile_completed", "updated_at"])

    def clean(self) -> None:
        """Custom validation for profile fields"""
        super().clean()

        if self.phone_number:
            import re

            phone_pattern = re.compile(r"^\+?[\d\s\-\(\)]+$")
            if not phone_pattern.match(self.phone_number):
                raise ValidationError({"phone_number": "Invalid phone number format"})
