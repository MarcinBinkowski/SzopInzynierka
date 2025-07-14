from rest_framework import serializers


class TemplateVariablesResponseSerializer(serializers.Serializer):
    """Serializer for template variables response."""

    variables = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField())
    )
