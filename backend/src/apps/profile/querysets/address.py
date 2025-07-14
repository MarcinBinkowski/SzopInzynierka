from django.db import models
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from apps.profile.models import Address
    from apps.profile.models import Profile
    from django.db.models.query import QuerySet


class AddressQuerySet(models.QuerySet["Address"]):
    """Custom QuerySet for Address model with filtering methods."""

    def for_profile(self, profile: "Profile") -> "QuerySet[Address]":
        return self.filter(profile=profile)

    def shipping_addresses(self) -> "QuerySet[Address]":
        return self.filter(address_type=Address.AddressType.SHIPPING)

    def billing_addresses(self) -> "QuerySet[Address]":
        return self.filter(address_type=Address.AddressType.BILLING)

    def default_addresses(self) -> "QuerySet[Address]":
        return self.filter(is_default=True)

    def get_default_for_profile(
        self, profile: "Profile", address_type: str
    ) -> "Address | None":
        return self.filter(
            profile=profile, address_type=address_type, is_default=True
        ).first()
