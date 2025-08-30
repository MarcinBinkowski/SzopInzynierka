from typing import TYPE_CHECKING

from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.profile.models import Address
from apps.profile.serializers import (
    AddressCreateSerializer,
    AddressListSerializer,
    AddressSerializer,
    AddressUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter

if TYPE_CHECKING:
    from apps.profile.models import Profile


@extend_schema(
    parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)]
)
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=AddressCreateSerializer,
        responses={201: AddressSerializer},
        description="Create a new address. Profile field is optional - if not provided, uses current user's profile.",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Address]:
        # Admin can see all addresses, regular users only their own
        if self.request.user.is_staff:
            return Address.objects.all()

        profile = getattr(self.request.user, "profile", None)
        if not profile:
            return Address.objects.none()
        return Address.objects.for_profile(profile)

    def get_serializer_class(self):
        serializer_map = {
            "list": AddressListSerializer,
            "create": AddressCreateSerializer,
            "update": AddressUpdateSerializer,
            "partial_update": AddressUpdateSerializer,
        }
        return serializer_map.get(self.action, AddressSerializer)

    def get_permissions(self):
        """Use admin permissions for admin actions."""
        if (
            self.action in ["create", "update", "partial_update", "destroy"]
            and self.request.user.is_staff
        ):
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer) -> None:
        if self.request.user.is_staff:
            # Admin can create addresses for any profile
            serializer.save()
        else:
            # Regular users can only create addresses for their own profile
            profile = self.request.user.profile
            serializer.save(profile=profile)

    def perform_update(self, serializer: AddressUpdateSerializer) -> None:
        address = serializer.save()
        if address.is_default:
            self._unset_other_defaults(address)

    def _unset_other_defaults(self, address: Address) -> None:
        Address.objects.filter(
            profile=address.profile,
            is_default=True,
        ).exclude(id=address.id).update(is_default=False)

    @action(detail=False, methods=["get"])
    def default(self, request: Request) -> Response:
        """Get the default address for the current user or specified profile."""
        if request.user.is_staff:
            # Admin needs to specify profile
            profile_id = request.query_params.get("profile_id")
            if not profile_id:
                return Response(
                    {"detail": "profile_id parameter required for admin access"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                from apps.profile.models import Profile

                profile = Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                return Response(
                    {"detail": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            profile = request.user.profile

        address = Address.objects.get_default_for_profile(profile)

        if not address:
            return Response(
                {"detail": "No default address found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AddressSerializer(address)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def set_default(self, request: Request, pk: str | None = None) -> Response:
        address = self.get_object()

        Address.objects.filter(
            profile=address.profile, is_default=True
        ).exclude(id=address.id).update(is_default=False)

        address.is_default = True
        address.save()

        serializer = self.get_serializer(address)
        return Response(serializer.data)

    @action(detail=False, methods=["patch"])
    def unset_default(self, request: Request) -> Response:
        """Unset the default address for the current user or specified profile."""
        if request.user.is_staff:
            # Admin needs to specify profile
            profile_id = request.data.get("profile_id")
            if not profile_id:
                return Response(
                    {"error": "profile_id is required for admin access"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                from apps.profile.models import Profile

                profile = Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            profile = request.user.profile

        updated_count = (
            Address.objects.for_profile(profile)
            .filter(is_default=True)
            .update(is_default=False)
        )

        return Response(
            {
                "message": "Unset default address",
                "updated_count": updated_count,
            }
        )

    @action(detail=False, methods=["get"])
    def summary(self, request: Request) -> Response:
        if request.user.is_staff:
            # Admin needs to specify profile
            profile_id = request.query_params.get("profile_id")
            if not profile_id:
                return Response(
                    {"detail": "profile_id parameter required for admin access"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                from apps.profile.models import Profile

                profile = Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                return Response(
                    {"detail": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            profile: "Profile" = request.user.profile

        addresses = Address.objects.for_profile(profile)
        default_address = Address.objects.get_default_for_profile(profile)

        return Response(
            {
                "total_addresses": addresses.count(),
                "has_default_address": default_address is not None,
                "is_checkout_ready": default_address is not None,
            }
        )
