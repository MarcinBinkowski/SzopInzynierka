from django.db import models
from django.conf import settings
from django.forms import ValidationError

from apps.common.models import TimestampedModel


class Profile(TimestampedModel):
    """Extended user profile with personal information."""

    class Role(models.IntegerChoices):
        ADMIN = 1
        EMPLOYEE = 2
        USER = 3

    user: models.OneToOneField = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        help_text="Associated user account",
    )
    role = models.IntegerField(choices=Role.choices, default=Role.USER)
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
        null=True, blank=True, help_text="User's date of birth"
    )
    phone_number: models.CharField = models.CharField(
        max_length=20, blank=True, help_text="Primary phone number with country code"
    )

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

    def get_default_address(self):
        """Get user's default address."""
        from apps.profile.models import Address

        return Address.get_default_address_for_profile(self)

    def is_checkout_ready(self) -> bool:
        """Check if profile has all required information for checkout."""
        personal_info_complete = all(
            [
                self.first_name.strip() if self.first_name else False,
                self.last_name.strip() if self.last_name else False,
                self.phone_number.strip() if self.phone_number else False,
            ]
        )

        default_address = self.get_default_address()

        return (
            personal_info_complete
            and default_address is not None
            and default_address.is_complete()
        )

    def get_missing_checkout_fields(self) -> list[str]:
        """Get list of fields required to complete checkout."""
        missing_fields: list[str] = []

        if not (self.first_name and self.first_name.strip()):
            missing_fields.append("First Name")
        if not (self.last_name and self.last_name.strip()):
            missing_fields.append("Last Name")
        if not (self.phone_number and self.phone_number.strip()):
            missing_fields.append("Phone Number")

        default_address = self.get_default_address()
        if not default_address:
            missing_fields.append("Default Address")
        elif not default_address.is_complete():
            missing_fields.append("Complete Default Address")

        return missing_fields

    def update_completion_status(self) -> None:
        current_status = self.profile_completed
        new_status = self.is_checkout_ready()

        if current_status != new_status:
            self.profile_completed = new_status
            self.save(update_fields=["profile_completed", "updated_at"])

    def clean(self) -> None:
        super().clean()

        if self.phone_number:
            import re

            phone_pattern = re.compile(r"^\+?[\d\s\-\(\)]+$")
            if not phone_pattern.match(self.phone_number):
                raise ValidationError({"phone_number": "Invalid phone number format"})
