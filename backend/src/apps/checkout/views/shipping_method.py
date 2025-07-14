from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles

from apps.checkout.models import ShippingMethod
from apps.checkout.serializers import ShippingMethodSerializer


class ShippingMethodViewSet(BaseViewSet):
    serializer_class = ShippingMethodSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "name",
        "description",
        "courier__name",
        "courier__contact_email",
        "estimated_delivery_days",
        "tracking_url_template",
    ]
    ordering_fields = [
        "id",
        "name",
        "price",
        "estimated_delivery_days",
        "is_active",
        "created_at",
        "updated_at",
        "courier__name",
        "courier__contact_email",
    ]
    ordering = ["name"]
    pagination_class = None

    queryset = ShippingMethod.objects.all()

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
