from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role

from apps.checkout.models import CouponRedemption
from apps.checkout.serializers import CouponRedemptionSerializer


class CouponRedemptionViewSet(BaseViewSet):
    queryset = CouponRedemption.objects.select_related("coupon", "order", "user").all()
    serializer_class = CouponRedemptionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = [
        "coupon__code",
        "coupon__description",
        "order__order_number",
        "order__user__email",
        "order__user__username",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
        "discount_amount",
        "original_total",
        "final_total",
        "coupon__code",
        "coupon__name",
        "order__id",
        "order__order_number",
        "order__status",
        "order__total",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role == Profile.Role.ADMIN:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
