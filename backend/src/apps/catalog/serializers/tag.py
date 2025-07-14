from rest_framework import serializers

from apps.catalog.models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model."""

    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
