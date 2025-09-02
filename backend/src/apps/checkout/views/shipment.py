from rest_framework import viewsets

from apps.checkout.models import Shipment
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers import ShipmentSerializer


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.select_related("order", "shipping_method", "courier")
    serializer_class = ShipmentSerializer
    filterset_fields = ["courier", "shipping_method", "order"]
    ordering_fields = ["shipped_at", "delivered_at", "created_at"]
    ordering = ["-shipped_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(order__user=self.request.user)
