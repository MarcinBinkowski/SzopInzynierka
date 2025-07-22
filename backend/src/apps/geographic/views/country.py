from typing import TYPE_CHECKING

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.geographic.models import Country
from apps.geographic.serializers import (
    CountrySerializer,
    CountryListSerializer,
    CountryCreateSerializer,
    CountryUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter

if TYPE_CHECKING:
    from apps.geographic.models import Country


@extend_schema(
    parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)]
)
class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["code", "name"]
    filter_backends = [SearchFilter, OrderingFilter]

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        serializer_map = {
            "list": CountryListSerializer,
            "create": CountryCreateSerializer,
            "update": CountryUpdateSerializer,
            "partial_update": CountryUpdateSerializer,
            "retrieve": CountrySerializer,
        }
        return serializer_map.get(self.action, CountrySerializer)

    def get_permissions(self):
        """Use admin permissions for write operations."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]
