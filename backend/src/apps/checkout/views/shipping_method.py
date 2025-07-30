from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.checkout.models import ShippingMethod
from apps.checkout.serializers import ShippingMethodSerializer


class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ShippingMethod model - read-only for users."""

    serializer_class = ShippingMethodSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Return all shipping methods."""
        return ShippingMethod.objects.all() 