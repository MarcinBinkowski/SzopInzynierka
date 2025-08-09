from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema

from apps.catalog.models.notification import (
    NotificationPreference,
    NotificationHistory,
)
from apps.catalog.serializers import (
    NotificationPreferenceSerializer,
    NotificationPreferenceUpdateSerializer,
    NotificationHistorySerializer,
    PushTokenRegistrationSerializer,
)


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user notification preferences."""
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    
    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return NotificationPreferenceUpdateSerializer
        return NotificationPreferenceSerializer
    
    def get_object(self):
        preference, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
    
    @extend_schema(
        tags=['notifications'],
        description="Get current user's notification preferences",
        responses={200: NotificationPreferenceSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['notifications'], 
        description="Update notification preferences",
        request=NotificationPreferenceUpdateSerializer,
        responses={200: NotificationPreferenceSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        tags=['notifications'],
        description="Register or update push notification token",
        request=PushTokenRegistrationSerializer,
        responses={200: {"description": "Token registered successfully"}}
    )
    @action(detail=False, methods=['post'])
    def register_token(self, request: Request):
        serializer = PushTokenRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preference, _ = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        preference.push_token = serializer.validated_data['push_token']
        preference.save()
        return Response({
            "message": "Push token registered successfully",
            "token": preference.push_token
        })
    
    @extend_schema(
        tags=['notifications'],
        description="Unregister push notification token",
        responses={200: {"description": "Token unregistered successfully"}}
    )
    @action(detail=False, methods=['post'])
    def unregister_token(self, request: Request):
        try:
            preference = NotificationPreference.objects.get(user=request.user)
            preference.push_token = None
            preference.save()
            return Response({"message": "Push token unregistered successfully"})
        except NotificationPreference.DoesNotExist:
            return Response({"message": "No notification preferences found"})


class NotificationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing notification history."""
    
    serializer_class = NotificationHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationHistory.objects.filter(user=self.request.user)
    
    @extend_schema(
        tags=['notifications'],
        description="List notification history for current user",
        responses={200: NotificationHistorySerializer}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['notifications'],
        description="Get specific notification from history",
        responses={200: NotificationHistorySerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)