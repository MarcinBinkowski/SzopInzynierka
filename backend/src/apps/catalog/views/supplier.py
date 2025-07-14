from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models import Supplier
from apps.catalog.serializers import SupplierSerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class SupplierViewSet(BaseViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    search_fields = ["name", "contact_email", "phone", "address", "website"]
    ordering_fields = [
        "id",
        "name",
        "contact_email",
        "phone",
        "address",
        "website",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]
