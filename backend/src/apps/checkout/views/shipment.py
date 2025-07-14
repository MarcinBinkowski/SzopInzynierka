from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.checkout.models import Shipment
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers import ShipmentSerializer


class ShipmentViewSet(BaseViewSet):
    queryset = Shipment.objects.select_related(
        "order", "order__shipping_method", "order__shipping_method__courier"
    )
    serializer_class = ShipmentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "order__order_number",
        "shipping_address",
        "order__id",
        "order__status",
        "order__total",
        "order__user__email",
        "order__user__username",
        "order__shipping_method__name",
        "order__shipping_method__courier__name",
    ]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "shipped_at",
        "delivered_at",
        "created_at",
        "updated_at",
        "order__id",
        "order__order_number",
        "order__status",
        "order__total",
        "order__user__email",
        "order__user__username",
        "order__user__first_name",
        "order__user__last_name",
        "order__shipping_method__name",
        "order__shipping_method__courier__name",
    ]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.EMPLOYEE, Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return self.queryset
        return self.queryset.filter(order__user=self.request.user)
