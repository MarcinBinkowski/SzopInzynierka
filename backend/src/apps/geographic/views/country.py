from typing import TYPE_CHECKING

from apps.common.models import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.geographic.models import Country
from apps.geographic.serializers import (
    CountrySerializer,
    CountryListSerializer,
    CountryCreateSerializer,
    CountryUpdateSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiParameter
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles

if TYPE_CHECKING:
    from apps.geographic.models import Country


@extend_schema(
    parameters=[OpenApiParameter(name="id", type=int, location=OpenApiParameter.PATH)]
)
class CountryViewSet(BaseViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    search_fields = ["code", "name", "currency_code", "currency_name"]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "code",
        "name",
        "currency_code",
        "currency_name",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]
    pagination_class = None

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
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
