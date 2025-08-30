from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from apps.checkout.models import CouponRedemption
from apps.checkout.serializers import CouponRedemptionSerializer


class CouponRedemptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CouponRedemption.objects.select_related("coupon", "order", "user").all()
    serializer_class = CouponRedemptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["coupon", "order", "user"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]


