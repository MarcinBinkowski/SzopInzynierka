from rest_framework import viewsets

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles

from apps.checkout.models import Courier
from apps.checkout.serializers import CourierSerializer


class CourierViewSet(viewsets.ModelViewSet):
    queryset = Courier.objects.all()
    serializer_class = CourierSerializer
    permission_classes = []
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
