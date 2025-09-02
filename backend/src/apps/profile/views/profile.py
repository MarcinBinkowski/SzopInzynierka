from django.db import models
from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.profile.permissions import get_user_role
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter

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
class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["first_name", "last_name", "user__email"]
    filter_backends = [SearchFilter, OrderingFilter]

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

        # Handle display_name search manually
        search_query = self.request.query_params.get("search", "").strip()
        if search_query and len(search_query) >= 2:
            # Search by display name (first_name + last_name)
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

    @action(detail=True, methods=["post"])
    def update_completion_status(
        self, request: Request, pk: str | None = None
    ) -> Response:
        profile = self.get_object()
        old_status = profile.profile_completed
        profile.update_completion_status()

        return Response(
            {
                "message": "Completion status updated",
                "old_status": old_status,
                "new_status": profile.profile_completed,
                "missing_fields": profile.get_missing_checkout_fields(),
            }
        )

    @action(detail=False, methods=["get"])
    def checkout_status(self, request: Request) -> Response:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "is_checkout_ready": profile.is_checkout_ready(),
                "profile_completed": profile.profile_completed,
                "missing_fields": profile.get_missing_checkout_fields(),
                "has_shipping_address": profile.get_default_shipping_address()
                is not None,
                "has_billing_address": profile.get_default_billing_address()
                is not None,
            }
        )

    @action(detail=False, methods=["get"])
    def addresses_summary(self, request: Request) -> Response:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        shipping_address = profile.get_default_shipping_address()
        billing_address = profile.get_default_billing_address()

        return Response(
            {
                "total_addresses": profile.addresses.count(),
                "shipping_address": shipping_address.get_address_dict()
                if shipping_address
                else None,
                "billing_address": billing_address.get_address_dict()
                if billing_address
                else None,
                "addresses": [
                    {
                        "id": addr.id,
                        "type": addr.address_type,
                        "label": addr.label,
                        "is_default": addr.is_default,
                        "city": addr.city,
                        "country": addr.country.name,
                    }
                    for addr in profile.addresses.all()
                ],
            }
        )

    @action(detail=False, methods=["patch"])
    def mark_completed(self, request: Request) -> Response:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        profile.profile_completed = True
        profile.save(update_fields=["profile_completed"])

        return Response(
            {
                "message": "Profile marked as completed",
                "profile_completed": True,
            }
        )

    @action(detail=False, methods=["get"])
    def completion_requirements(self, request: Request) -> Response:
        return Response(
            {
                "required_fields": [
                    "first_name",
                    "last_name",
                    "phone_number",
                ],
                "required_addresses": [
                    "default_shipping_address",
                    "default_billing_address",
                ],
                "description": "Profile must have all required fields and both default addresses to be checkout ready",
            }
        )

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
