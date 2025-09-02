from rest_framework import viewsets

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles

from apps.checkout.models import ShippingMethod
from apps.checkout.serializers import ShippingMethodSerializer


class ShippingMethodViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingMethodSerializer
    pagination_class = None

    queryset = ShippingMethod.objects.all()

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
