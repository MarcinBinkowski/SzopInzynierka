from rest_framework import serializers
from apps.profile.permissions import get_user_role
from django.contrib.auth import get_user_model

from apps.profile.models import Address, Profile

User = get_user_model()


class ProfileMinimalSerializer(serializers.ModelSerializer):
    """Minimal profile serializer for address responses."""

    user_email = serializers.CharField(source="user.email", read_only=True)
    display_name = serializers.CharField(source="get_display_name", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_email",
            "display_name",
            "first_name",
            "last_name",
        ]


class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(source="get_full_address", read_only=True)
    address_dict = serializers.DictField(source="get_address_dict", read_only=True)
    is_complete = serializers.BooleanField(read_only=True)
    profile = ProfileMinimalSerializer(read_only=True)

    class Meta:
        model = Address
        fields = [
            "id",
            "profile",
            "address",
            "city",
            "postal_code",
            "country",
            "is_default",
            "label",
            "full_address",
            "address_dict",
            "is_complete",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "profile",
            "full_address",
            "address_dict",
            "is_complete",
            "created_at",
            "updated_at",
        ]

    def validate(self, data: dict) -> dict:
        """Cross-field validation for required address fields."""
        required_fields = ["address", "city", "postal_code", "country"]
        missing_fields = [
            field for field in required_fields if not data.get(field, "").strip()
        ]

        if missing_fields:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        f"Required fields missing: {', '.join(missing_fields)}"
                    ]
                }
            )

        return data


class AddressCreateSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(),
        required=False,
        help_text="Profile ID to assign this address to. If not provided, uses current user's profile.",
    )

    class Meta:
        model = Address
        fields = [
            "profile",
            "address",
            "city",
            "postal_code",
            "country",
            "is_default",
            "label",
        ]

    def validate(self, data: dict) -> dict:
        """Validate that only admin users can specify profile."""
        request = self.context.get("request")

        if "profile" in data and request and hasattr(request, "user"):
            role = get_user_role(getattr(request, "user", None))
            if role != Profile.Role.ADMIN:
                raise serializers.ValidationError(
                    {
                        "profile": "Only admin users can specify profile. Regular users must use their own profile."
                    }
                )

        return data

    def create(self, validated_data: dict) -> Address:
        """Create address with profile from request context or provided profile."""
        request = self.context.get("request")

        if "profile" not in validated_data and request and hasattr(request, "user"):
            validated_data["profile"] = request.user.profile

        return super().create(validated_data)


class AddressListSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(source="get_full_address", read_only=True)
    profile = ProfileMinimalSerializer(read_only=True)

    class Meta:
        model = Address
        fields = [
            "id",
            "profile",
            "full_address",
            "label",
            "is_default",
            "created_at",
        ]


class AddressUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "address",
            "city",
            "postal_code",
            "country",
            "is_default",
            "label",
        ]
