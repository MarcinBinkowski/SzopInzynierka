from typing import List, Set, Tuple
from jinja2 import Template, TemplateSyntaxError


class TemplateValidator:
    """Validates Jinja2 templates for security and allowed properties."""

    ALLOWED_MODEL_PROPERTIES = {
        "order": {
            "order_number",
            "total",
            "subtotal",
            "shipping_cost",
            "status",
            "created_at",
            "updated_at",
            "shipping_address",
            "shipping_method",
            "applied_coupon",
            "coupon_discount",
        },
        "order_items": {"product", "quantity", "unit_price", "total_price"},
        "product": {"name", "description", "price", "sku"},
        "user": {"first_name", "last_name", "email", "username"},
        "shipping_address": {
            "street_address",
            "city",
            "state",
            "postal_code",
            "country",
        },
        "shipping_method": {"name", "price"},
    }

    FORBIDDEN_PROPERTIES = {
        "password",
        "secret",
        "token",
        "key",
        "private",
        "internal",
        "admin",
        "superuser",
        "is_staff",
        "is_superuser",
        "groups",
        "permissions",
        "date_joined",
        "last_login",
    }

    @classmethod
    def validate_template(cls, content: str) -> Tuple[bool, List[str]]:
        """
        Validates template content for syntax and security.

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        try:
            Template(content)
        except TemplateSyntaxError as e:
            errors.append(f"Template syntax error: {str(e)}")
            return False, errors

        variables = cls.extract_variables(content)

        for var in variables:
            if any(forbidden in var.lower() for forbidden in cls.FORBIDDEN_PROPERTIES):
                errors.append(f"Forbidden property detected: {var}")

        return len(errors) == 0, errors

    @classmethod
    def extract_variables(cls, content: str) -> Set[str]:
        """Extract Jinja2 variables from template content."""
        variables = set()

        import re

        pattern = r"\{\{\s*([^}]+)\s*\}\}"
        matches = re.findall(pattern, content)

        for match in matches:
            var = match.strip()
            if "." in var:
                base_var = var.split(".")[0]
                variables.add(base_var)
                variables.add(var)
            else:
                variables.add(var)

        return variables
