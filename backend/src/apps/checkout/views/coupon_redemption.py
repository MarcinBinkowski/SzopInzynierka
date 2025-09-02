from rest_framework import viewsets

from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role

from apps.checkout.models import CouponRedemption
from apps.checkout.serializers import CouponRedemptionSerializer


class CouponRedemptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CouponRedemption.objects.select_related("coupon", "order", "user").all()
    serializer_class = CouponRedemptionSerializer
    filterset_fields = ["coupon", "order", "user"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role == Profile.Role.ADMIN:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
