from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS

from apps.checkout.models import ShippingMethod
from apps.checkout.serializers import ShippingMethodSerializer


class ShippingMethodViewSet(viewsets.ModelViewSet):
    """ViewSet for ShippingMethod model.

    - Authenticated users: can list and retrieve
    - Admin users: full CRUD (create, update, delete)
    """

    serializer_class = ShippingMethodSerializer
    pagination_class = None

    queryset = ShippingMethod.objects.all()

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()] 