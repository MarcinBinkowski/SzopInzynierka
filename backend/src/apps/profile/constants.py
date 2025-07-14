"""
Constants and configuration for the users app.

This module contains all constants, enums, and configuration that might
need to be changed or referenced across multiple files in the users app.
"""

from typing import Final

PROFILE_FIELD_LABELS: Final[dict[str, str]] = {
    "first_name": "First Name",
    "last_name": "Last Name",
    "phone_number": "Phone Number",
    "date_of_birth": "Date of Birth",
    "shipping_address_line_1": "Shipping Address",
    "shipping_address_line_2": "Shipping Address Line 2",
    "shipping_city": "Shipping City",
    "shipping_postal_code": "Shipping Postal Code",
    "shipping_country": "Shipping Country",
    "billing_address_line_1": "Billing Address",
    "billing_address_line_2": "Billing Address Line 2",
    "billing_city": "Billing City",
    "billing_postal_code": "Billing Postal Code",
    "billing_country": "Billing Country",
}

CHECKOUT_REQUIRED_PERSONAL_FIELDS: Final[list[str]] = [
    "first_name",
    "last_name",
    "phone_number",
]

PHONE_NUMBER_PATTERN: Final[str] = r"^\+?[\d\s\-\(\)]+$"
