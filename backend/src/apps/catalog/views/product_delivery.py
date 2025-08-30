from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS

from apps.catalog.models import ProductDelivery
from apps.catalog.serializers import ProductDeliverySerializer


class ProductDeliveryViewSet(viewsets.ModelViewSet):
    queryset = ProductDelivery.objects.select_related("supplier", "product")
    serializer_class = ProductDeliverySerializer
    permission_classes = []
    filterset_fields = ["supplier", "product", "delivery_date"]
    ordering_fields = ["delivery_date", "created_at"]
    ordering = ["-delivery_date"]

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]


