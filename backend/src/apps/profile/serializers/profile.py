from rest_framework import serializers
from typing import Any

from apps.profile.models import Profile


class ProfileListSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True, source="get_display_name")
    user_email = serializers.CharField(read_only=True, source="user.email")

    class Meta:
        model = Profile
        fields = [
            "id",
            "first_name",
            "last_name",
            "display_name",
            "user_email",
            "profile_completed",
            "created_at",
            "updated_at",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile management."""

    # Read-only computed fields
    display_name = serializers.CharField(read_only=True, source="get_display_name")
    full_name = serializers.CharField(read_only=True, source="get_full_name")
    age = serializers.IntegerField(read_only=True, source="get_age")
    is_checkout_ready = serializers.BooleanField(read_only=True)
    missing_checkout_fields = serializers.ListField(
        read_only=True, source="get_missing_checkout_fields"
    )

    # Address information (read-only)
    shipping_address = serializers.DictField(
        read_only=True, source="get_shipping_address_dict"
    )
    billing_address = serializers.DictField(
        read_only=True, source="get_billing_address_dict"
    )

    # Phone number with OpenAPI pattern annotation
    phone_number = serializers.RegexField(
        regex=r"^\+?[\d\s\-\(\)]+$",
        required=False,
        allow_blank=True,
        help_text="Phone number in international format. Supports digits, spaces, hyphens, parentheses, and optional '+' prefix. Example: +48131012012",
    )

    class Meta:
        model = Profile
        fields = [
            "id",
            "first_name",
            "last_name",
            "date_of_birth",
            "phone_number",
            "role",
            "profile_completed",
            "display_name",
            "full_name",
            "age",
            "is_checkout_ready",
            "missing_checkout_fields",
            "shipping_address",
            "billing_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "profile_completed", "created_at", "updated_at"]

    def validate_phone_number(self, value: str) -> str:
        """Validate phone number format."""
        if not value:
            return value

        import re

        phone_pattern = re.compile(r"^\+?[\d\s\-\(\)]+$")
        if not phone_pattern.match(value):
            raise serializers.ValidationError("Invalid phone number format")

        return value.strip()

    def update(self, instance: Profile, validated_data: dict[str, Any]) -> Profile:
        """Update profile and refresh completion status."""
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Update completion status after saving
        instance.update_completion_status()

        return instance


class ProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new profiles (admin only)."""

    phone_number = serializers.RegexField(
        regex=r"^\+?[\d\s\-\(\)]+$",
        required=False,
        allow_blank=True,
        help_text="Phone number in international format. Supports digits, spaces, hyphens, parentheses, and optional '+' prefix. Example: +48131012012",
    )

    class Meta:
        model = Profile
        fields = [
            "user",
            "first_name",
            "last_name",
            "date_of_birth",
            "phone_number",
        ]

    def validate_user(self, value):
        """Ensure user doesn't already have a profile."""
        if hasattr(value, "profile"):
            raise serializers.ValidationError("User already has a profile")
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    # Phone number with OpenAPI pattern annotation
    phone_number = serializers.RegexField(
        regex=r"^\+?[\d\s\-\(\)]+$",
        required=False,
        allow_blank=True,
        help_text="Phone number in international format. Supports digits, spaces, hyphens, parentheses, and optional '+' prefix. Example: +48131012012",
    )

    class Meta:
        model = Profile
        fields = [
            "first_name",
            "last_name",
            "date_of_birth",
            "phone_number",
            "role",
        ]

    def validate_phone_number(self, value: str) -> str:
        if not value:
            return value

        import re

        phone_pattern = re.compile(r"^\+?[\d\s\-\(\)]+$")
        if not phone_pattern.match(value):
            raise serializers.ValidationError("Invalid phone number format")

        return value.strip()
    
    def validate_role(self, value: int) -> int:
        """Validate role change - only admins can change roles."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from apps.profile.permissions import get_user_role
            user_role = get_user_role(request.user)
            
            # Only admins can change roles
            if user_role != Profile.Role.ADMIN:
                raise serializers.ValidationError("Only administrators can change user roles.")
        
        return value

    def update(self, instance: Profile, validated_data: dict[str, Any]) -> Profile:
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        instance.update_completion_status()

        return instance
