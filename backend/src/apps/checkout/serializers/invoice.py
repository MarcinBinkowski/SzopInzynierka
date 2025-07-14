from rest_framework import serializers
from apps.checkout.models import InvoiceTemplate, Invoice
from apps.checkout.services.template_validator import TemplateValidator


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    """Serializer for invoice templates."""
    
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = InvoiceTemplate
        fields = [
            "id",
            "name",
            "content",
            "is_default",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_by_name", "created_at", "updated_at"]

    def validate_content(self, value):
        """Validate template content using TemplateValidator."""
        is_valid, errors = TemplateValidator.validate_template(value)
        if not is_valid:
            raise serializers.ValidationError(f"Invalid template: {', '.join(errors)}")
        return value

    def create(self, validated_data):
        """Set the current user as creator."""
        validated_data["created_by"] = self.context["request"].user

        # If creating as default, unset any existing default
        if validated_data.get("is_default", False):
            InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Handle setting template as default by unsetting any existing default."""
        print(f"DEBUG: Serializer update called with validated_data: {validated_data}")
        print(f"DEBUG: instance.is_default before: {instance.is_default}")

        if validated_data.get("is_default", False):
            print("DEBUG: Setting as default, unsetting existing defaults")
            InvoiceTemplate.objects.filter(is_default=True).exclude(
                id=instance.id
            ).update(is_default=False)

        result = super().update(instance, validated_data)
        print(f"DEBUG: instance.is_default after: {result.is_default}")
        return result


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
