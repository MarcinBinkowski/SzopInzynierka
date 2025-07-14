from rest_framework import serializers
from apps.geographic.models import Country


class CountrySerializer(serializers.ModelSerializer):
    """Full country serializer with all fields."""

    class Meta:
        model = Country
        fields = [
            "id",
            "code",
            "name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_code(self, value: str) -> str:
        """Validate and normalize country code."""
        if value:
            value = value.upper().strip()
            if len(value) != 2:
                raise serializers.ValidationError(
                    "Country code must be exactly 2 characters"
                )
        return value

    def validate_name(self, value: str) -> str:
        """Validate and normalize country name."""
        if value:
            value = value.strip()
            if len(value) < 2:
                raise serializers.ValidationError(
                    "Country name must be at least 2 characters"
                )
        return value


class CountryListSerializer(serializers.ModelSerializer):
    """Simplified country serializer for list views."""

    class Meta:
        model = Country
        fields = [
            "id",
            "code",
            "name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class CountryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new countries (admin only)."""

    class Meta:
        model = Country
        fields = [
            "code",
            "name",
        ]

    def validate_code(self, value: str) -> str:
        """Validate and normalize country code."""
        if value:
            value = value.upper().strip()
            if len(value) != 2:
                raise serializers.ValidationError(
                    "Country code must be exactly 2 characters"
                )
        return value

    def validate_name(self, value: str) -> str:
        """Validate and normalize country name."""
        if value:
            value = value.strip()
            if len(value) < 2:
                raise serializers.ValidationError(
                    "Country name must be at least 2 characters"
                )
        return value


class CountryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating countries (admin only)."""

    class Meta:
        model = Country
        fields = [
            "code",
            "name",
        ]

    def validate_code(self, value: str) -> str:
        """Validate and normalize country code."""
        if value:
            value = value.upper().strip()
            if len(value) != 2:
                raise serializers.ValidationError(
                    "Country code must be exactly 2 characters"
                )
        return value

    def validate_name(self, value: str) -> str:
        """Validate and normalize country name."""
        if value:
            value = value.strip()
            if len(value) < 2:
                raise serializers.ValidationError(
                    "Country name must be at least 2 characters"
                )
        return value
