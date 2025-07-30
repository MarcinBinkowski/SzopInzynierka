from typing import TYPE_CHECKING

from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.catalog.models import Manufacturer
from apps.catalog.serializers import (
    ManufacturerSerializer,
    ManufacturerListSerializer,
    ManufacturerCreateSerializer,
    ManufacturerUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter

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

        # Only show active manufacturers for non-admin users
        if not self.request.user.is_staff:
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
        """Use admin permissions for write operations."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]
