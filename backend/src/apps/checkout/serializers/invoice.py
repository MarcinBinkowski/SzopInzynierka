from rest_framework import serializers
from apps.checkout.models import InvoiceTemplate, Invoice
from apps.checkout.services.template_validator import TemplateValidator


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    """Serializer for invoice templates."""

    class Meta:
        model = InvoiceTemplate
        fields = [
            "id",
            "name",
            "content",
            "is_default",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate_content(self, value):
        """Validate template content using TemplateValidator."""
        is_valid, errors = TemplateValidator.validate_template(value)
        if not is_valid:
            raise serializers.ValidationError(f"Invalid template: {', '.join(errors)}")
        return value

    def create(self, validated_data):
        """Set the current user as creator."""
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""

    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order",
            "order_number",
            "invoice_number",
            "html_content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["invoice_number", "created_at", "updated_at"]
