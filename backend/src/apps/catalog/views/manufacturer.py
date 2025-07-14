from typing import TYPE_CHECKING

from django.db.models import QuerySet
from apps.common.models import BaseViewSet
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models import Manufacturer
from apps.catalog.serializers import (
    ManufacturerSerializer,
    ManufacturerListSerializer,
    ManufacturerCreateSerializer,
    ManufacturerUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter
from apps.profile.models import Profile
from apps.profile.permissions import RolesAllowed, get_user_role

if TYPE_CHECKING:
    from apps.catalog.models import Manufacturer


@extend_schema(
    parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)]
)
class ManufacturerViewSet(BaseViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    search_fields = ["name", "description", "website", "contact_email", "phone"]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    pagination_class = None

    ordering_fields = [
        "id",
        "name",
        "description",
        "website",
        "contact_email",
        "phone",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]
    pagination_class = None

    def get_queryset(self) -> QuerySet[Manufacturer]:
        """Filter queryset based on user permissions."""
        queryset = Manufacturer.objects.all()

        role = get_user_role(getattr(self.request, "user", None))
        if role not in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            queryset = queryset.filter(is_active=True)

        return queryset

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        serializer_map = {
            "list": ManufacturerListSerializer,
            "create": ManufacturerCreateSerializer,
            "update": ManufacturerUpdateSerializer,
            "retrieve": ManufacturerSerializer,
        }
        return serializer_map.get(self.action, ManufacturerSerializer)

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [RolesAllowed({Profile.Role.ADMIN})]
