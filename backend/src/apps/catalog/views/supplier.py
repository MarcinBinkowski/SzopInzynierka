from rest_framework import viewsets


from apps.catalog.models import Supplier
from apps.catalog.serializers import SupplierSerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filterset_fields = ["name"]
    search_fields = ["name", "contact_email", "phone"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
