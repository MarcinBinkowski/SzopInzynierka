from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS

from apps.checkout.models import Shipment
from apps.checkout.serializers import ShipmentSerializer


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.select_related("order", "shipping_method", "courier")
    serializer_class = ShipmentSerializer
    permission_classes = []
    filterset_fields = ["courier", "shipping_method", "order"]
    ordering_fields = ["shipped_at", "delivered_at", "created_at"]
    ordering = ["-shipped_at"]

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]


