from rest_framework import serializers

from apps.checkout.models import OrderProcessingNote


class OrderProcessingNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProcessingNote
        fields = [
            "id",
            "order",
            "staff_member",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


