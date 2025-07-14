from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models import Category
from apps.catalog.serializers import CategorySerializer
from apps.profile.models import Profile
from apps.profile.permissions import get_user_role, ReadOnlyOrRoles
from apps.common.models import BaseViewSet


class CategoryViewSet(BaseViewSet):
    """ViewSet for Category model with CRUD operations."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    search_fields = ["name", "slug", "description"]
    ordering_fields = [
        "id",
        "name",
        "slug",
        "description",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]
    pagination_class = None

    def get_queryset(self):
        """Optimize queryset based on action."""
        queryset = super().get_queryset()

        if self.action in ["list", "retrieve"]:
            queryset = queryset.prefetch_related("products")

        role = get_user_role(getattr(self.request, "user", None))
        if role not in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            queryset = queryset.filter(is_active=True)

        return queryset
