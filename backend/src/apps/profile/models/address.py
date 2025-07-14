from django.db import models

from apps.common.models import TimestampedModel
from apps.geographic.models import Country
from apps.profile.models.profile import Profile


class Address(TimestampedModel):
    """Address model for user addresses."""

    objects = models.Manager()

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="addresses",
        help_text="Profile who owns this address",
    )

    address = models.CharField(
        max_length=255,
        help_text="Street address, apartment, unit, etc.",
    )
    city = models.CharField(
        max_length=100,
        help_text="City name",
    )
    postal_code = models.CharField(
        max_length=20,
        help_text="ZIP code or postal code",
    )
    country = models.ForeignKey(
        Country,
        on_delete=models.PROTECT,
        related_name="addresses",
        help_text="Country for this address",
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Whether this is the default address",
    )
    label = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional label like 'Home', 'Office', etc.",
    )

    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
        ordering = ["-is_default", "-created_at"]

        indexes = [
            models.Index(fields=["profile", "is_default"]),
            models.Index(fields=["country"]),
        ]

    def __str__(self) -> str:
        label_part = f" ({self.label})" if self.label else ""
        return f"{label_part} - {self.address}, {self.city}".lstrip(" - ")

    def get_full_address(self) -> str:
        address_parts = [self.address, self.city, self.postal_code, self.country.name]
        return ", ".join(address_parts)

    def get_address_dict(self) -> dict[str, str]:
        """Get address as a dictionary for APIs or templates."""
        return {
            "address": self.address,
            "city": self.city,
            "postal_code": self.postal_code,
            "country": self.country.name,
            "country_code": self.country.code,
            "is_default": self.is_default,
            "label": self.label,
        }

    def is_complete(self) -> bool:
        required_fields = [self.address, self.city, self.postal_code, self.country]
        return all(
            field and (isinstance(field, str) and field.strip() or field)
            for field in required_fields
        )

    def clean(self) -> None:
        super().clean()

        if self.address:
            self.address = self.address.strip()
        if self.city:
            self.city = self.city.strip()

    def save(self, *args, **kwargs) -> None:
        if self.is_default:
            Address.objects.filter(profile=self.profile, is_default=True).exclude(
                pk=self.pk
            ).update(is_default=False)

        super().save(*args, **kwargs)

    @classmethod
    def get_default_address_for_profile(cls, profile: "Profile") -> "Address | None":
        return cls.objects.filter(profile=profile, is_default=True).first()
