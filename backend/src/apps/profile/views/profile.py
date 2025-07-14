from django.db import models
from django.db.models import QuerySet
from rest_framework import status
from apps.common.models import BaseViewSet
from rest_framework.decorators import action
from apps.profile.permissions import get_user_role
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.profile.models import Profile
from apps.profile.serializers import (
    ProfileCreateSerializer,
    ProfileListSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter


@extend_schema(
    parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)]
)
class ProfileViewSet(BaseViewSet):
    serializer_class = ProfileSerializer
    search_fields = [
        "first_name",
        "last_name",
        "phone_number",
        "date_of_birth",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "first_name",
        "last_name",
        "phone_number",
        "date_of_birth",
        "role",
        "profile_completed",
        "created_at",
        "updated_at",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__date_joined",
        "user__is_active",
    ]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet[Profile]:
        role = get_user_role(getattr(self.request, "user", None))
        if role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return Profile.objects.select_related("user").prefetch_related("addresses")

        try:
            return (
                Profile.objects.filter(user=self.request.user)
                .select_related("user")
                .prefetch_related("addresses")
            )
        except Profile.DoesNotExist:
            return Profile.objects.none()

    def filter_queryset(self, queryset):
        """Custom filtering to handle display_name search."""
        queryset = super().filter_queryset(queryset)

        search_query = self.request.query_params.get("search", "").strip()
        if search_query and len(search_query) >= 2:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search_query)
                | models.Q(last_name__icontains=search_query)
                | models.Q(user__email__icontains=search_query)
                | models.Q(user__username__icontains=search_query)
            )

        return queryset

    def get_serializer_class(self):
        serializer_map = {
            "list": ProfileListSerializer,
            "create": ProfileCreateSerializer,
            "update": ProfileUpdateSerializer,
            "partial_update": ProfileUpdateSerializer,
        }
        return serializer_map.get(self.action, ProfileSerializer)

    def get_object(self):
        if self.kwargs.get("pk") == "me":
            try:
                return self.request.user.profile
            except Profile.DoesNotExist:
                from rest_framework.exceptions import NotFound

                raise NotFound("Profile not found")
        return super().get_object()

    def perform_create(self, serializer: ProfileCreateSerializer) -> None:
        if not self.request.user.is_superuser:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer: ProfileUpdateSerializer) -> None:
        profile = serializer.save()
        profile.update_completion_status()

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request: Request) -> Response:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "GET":
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request: Request, *args, **kwargs) -> Response:
        if not request.user.is_superuser and hasattr(request.user, "profile"):
            return Response(
                {"error": "User already has a profile"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        if not request.user.is_superuser:
            return Response(
                {"error": "Only administrators can delete profiles"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def checkout_status(self, request):
        """Get checkout readiness status for the current user's profile."""
        try:
            profile = request.user.profile
            return Response(
                {
                    "is_checkout_ready": profile.is_checkout_ready(),
                    "missing_fields": profile.get_missing_checkout_fields(),
                    "profile_completed": profile.profile_completed,
                }
            )
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
