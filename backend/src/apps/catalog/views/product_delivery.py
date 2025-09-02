from rest_framework import viewsets

from apps.catalog.models import ProductDelivery
from apps.catalog.serializers import ProductDeliverySerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class ProductDeliveryViewSet(viewsets.ModelViewSet):
    queryset = ProductDelivery.objects.select_related("supplier", "product")
    serializer_class = ProductDeliverySerializer
    permission_classes = []
    filterset_fields = ["supplier", "product", "delivery_date"]
    ordering_fields = ["delivery_date", "created_at"]
    ordering = ["-delivery_date"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
