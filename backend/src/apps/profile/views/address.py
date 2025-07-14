from typing import TYPE_CHECKING

from django.db.models import QuerySet
from apps.common.models import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.profile.permissions import get_user_role
from apps.profile.models import Profile
from django_filters.rest_framework import DjangoFilterBackend

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
class AddressViewSet(BaseViewSet):
    serializer_class = AddressSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    pagination_class = None

    search_fields = [
        "label",
        "address_line_1",
        "address_line_2",
        "city",
        "state_province",
        "postal_code",
        "country__name",
        "country__code",
        "profile__user__email",
        "profile__user__username",
    ]
    ordering_fields = [
        "id",
        "label",
        "address_line_1",
        "city",
        "state_province",
        "postal_code",
        "is_default",
        "address_type",
        "created_at",
        "updated_at",
        "country__name",
        "profile__user__email",
    ]
    ordering = ["-is_default", "label"]

    @extend_schema(
        request=AddressCreateSerializer,
        responses={201: AddressSerializer},
        description="Create a new address. Profile field is optional - if not provided, uses current user's profile.",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Address]:
        role = get_user_role(getattr(self.request, "user", None))
        if role in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return Address.objects.all()

        profile = getattr(self.request.user, "profile", None)
        if not profile:
            return Address.objects.none()
        return Address.objects.filter(profile=profile)

    def get_serializer_class(self):
        serializer_map = {
            "list": AddressListSerializer,
            "create": AddressCreateSerializer,
            "update": AddressUpdateSerializer,
            "partial_update": AddressUpdateSerializer,
        }
        return serializer_map.get(self.action, AddressSerializer)

    def perform_create(self, serializer) -> None:
        role = get_user_role(getattr(self.request, "user", None))
        if role == Profile.Role.ADMIN:
            serializer.save()
        else:
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
