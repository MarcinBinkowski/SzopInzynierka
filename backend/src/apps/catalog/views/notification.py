from apps.common.models import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models.notification import (
    NotificationPreference,
    NotificationHistory,
)
from apps.catalog.serializers import (
    NotificationPreferenceSerializer,
    NotificationPreferenceUpdateSerializer,
    NotificationHistorySerializer,
)
from apps.profile.models import Profile
from apps.profile.permissions import get_user_role


class NotificationPreferenceViewSet(BaseViewSet):
    """ViewSet for managing user notification preferences."""

    serializer_class = NotificationPreferenceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    ordering = ["-created_at"]
    pagination_class = None

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        queryset = NotificationPreference.objects.select_related("user")
        
        if role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return queryset
        else:
            return queryset.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return NotificationPreferenceUpdateSerializer
        return NotificationPreferenceSerializer

    def get_object(self):
        preference, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference

    @extend_schema(
        tags=["notifications"],
        description="Get current user's notification preferences",
        responses={200: NotificationPreferenceSerializer},
    )
    @extend_schema(
        tags=["notifications"],
        description="Get current user's notification preferences",
        responses={200: NotificationPreferenceSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=["notifications"],
        description="Update notification preferences",
        request=NotificationPreferenceUpdateSerializer,
        responses={200: NotificationPreferenceSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class NotificationHistoryViewSet(BaseViewSet):
    """ViewSet for viewing notification history."""

    serializer_class = NotificationHistorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id", "user", "notification_type"]

    search_fields = [
        "product__name",
        "product__sku",
        "product__description",
        "notification_type",
        "title",
        "body",
        "user__email",
        "user__username",
    ]
    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
        "notification_type",
        "product__name",
        "product__sku",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        queryset = NotificationHistory.objects.select_related("product", "user")

        if role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return queryset
        else:
            return queryset.filter(user=self.request.user)

    @extend_schema(
        tags=["notifications"],
        description="List notification history",
        responses={200: NotificationHistorySerializer},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=["notifications"],
        description="Get specific notification from history",
        responses={200: NotificationPreferenceSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
