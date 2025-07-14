from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models import Tag
from apps.catalog.serializers import TagSerializer
from apps.profile.models import Profile
from apps.profile.permissions import RolesAllowed
from apps.common.models import BaseViewSet


class TagViewSet(BaseViewSet):
    """ViewSet for Tag model with CRUD operations."""

    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [RolesAllowed({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    search_fields = ["name", "slug"]
    ordering_fields = ["id", "name", "slug", "created_at", "updated_at"]
    ordering = ["name"]
