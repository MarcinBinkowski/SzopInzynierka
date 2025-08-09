from rest_framework import serializers
from apps.catalog.models.notification import (
    NotificationPreference,
    NotificationHistory,
)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model."""
    
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "push_token",
            "stock_alerts_enabled",
            "price_drop_alerts_enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationPreferenceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification preferences."""
    
    class Meta:
        model = NotificationPreference
        fields = [
            "push_token",
            "stock_alerts_enabled", 
            "price_drop_alerts_enabled",
        ]


class NotificationHistorySerializer(serializers.ModelSerializer):
    """Serializer for NotificationHistory model."""
    
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = NotificationHistory
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "notification_type",
            "title",
            "body",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "product_image",
            "created_at",
        ]
    
    def get_product_image(self, obj):
        """Get the first product image URL."""
        first_image = obj.product.images.first()
        if first_image:
            return first_image.image.url
        return None


class PushTokenRegistrationSerializer(serializers.Serializer):
    """Serializer for registering push tokens."""
    
    push_token = serializers.CharField(
        max_length=255,
        help_text="Expo push notification token"
    )
    
    def validate_push_token(self, value):
        """Validate the push token format."""
        if not value.startswith(('ExponentPushToken[', 'ExpoPushToken[')):
            raise serializers.ValidationError(
                "Invalid Expo push token format. Token should start with 'ExponentPushToken[' or 'ExpoPushToken['"
            )
        return value