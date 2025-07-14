from rest_framework import serializers

from apps.checkout.models import OrderProcessingNote


class OrderProcessingNoteSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.order_number", read_only=True)
    staff_member_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderProcessingNote
        fields = [
            "id",
            "order",
            "order_number",
            "staff_member",
            "staff_member_name",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "staff_member_name",
            "staff_member",
            "created_at",
            "updated_at",
        ]

    def get_staff_member_name(self, obj):
        return obj.staff_member.email

    def create(self, validated_data):
        validated_data["staff_member"] = self.context["request"].user
        return super().create(validated_data)
