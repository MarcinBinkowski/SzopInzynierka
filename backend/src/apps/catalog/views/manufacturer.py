from typing import TYPE_CHECKING

from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.filters import OrderingFilter, SearchFilter

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
class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name", "description"]
    filter_backends = [SearchFilter, OrderingFilter]
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
        # Read-only for authenticated users; writes require admin
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [RolesAllowed({Profile.Role.ADMIN})]
