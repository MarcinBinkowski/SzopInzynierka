from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles

from apps.checkout.models import Courier
from apps.checkout.serializers import CourierSerializer


class CourierViewSet(BaseViewSet):
    queryset = Courier.objects.all()
    serializer_class = CourierSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    search_fields = ["name", "description", "contact_email", "phone", "website"]
    ordering_fields = [
        "id",
        "name",
        "description",
        "contact_email",
        "phone",
        "website",
        "is_active",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
