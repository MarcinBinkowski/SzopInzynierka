from apps.common.models import BaseViewSet
from rest_framework import status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, inline_serializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from apps.checkout.models.coupon import Coupon
from apps.checkout.serializers.coupon import (
    CouponSerializer,
    CouponValidationResponseSerializer,
)
from apps.checkout.services.coupon_service import CouponService


class CouponViewSet(BaseViewSet):
    """Full CRUD ViewSet for coupon management."""

    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "code",
        "name",
        "description",
        "discount_amount",
        "discount_type",
        "discount_value",
        "created_by__email",
        "created_by__username",
    ]
    ordering_fields = [
        "id",
        "code",
        "name",
        "description",
        "discount_amount",
        "discount_type",
        "discount_value",
        "is_active",
        "valid_from",
        "valid_until",
        "max_uses",
        "max_uses_per_user",
        "usage_count",
        "created_at",
        "updated_at",
        "created_by__email",
        "created_by__username",
        "created_by__first_name",
        "created_by__last_name",
    ]
    ordering = ["code"]

    def get_permissions(self):
        if self.action in ["validate", "remove"]:
            return []
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def get_queryset(self):
        """Optimize queryset with prefetch for usage count."""
        return self.queryset.prefetch_related('redemptions').annotate(
            usage_count=Count('redemptions')
        )

    def list(self, request, *args, **kwargs):
        role = get_user_role(getattr(self.request, "user", None))
        if role not in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return Response(
                {"error": "Only administrators can list coupons"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Validate coupon",
        description="Validate and apply coupon to cart",
        request=inline_serializer(
            name="CouponValidateRequest",
            fields={
                "code": serializers.CharField(max_length=20),
            },
        ),
        responses={200: CouponValidationResponseSerializer},
    )
    @action(detail=False, methods=["post"])
    def validate(self, request):
        """Validate and apply coupon to cart."""
        code = request.data.get("code")
        if not code:
            return Response(
                {"error": "Coupon code is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response(
                {"error": "Invalid coupon code"}, status=status.HTTP_404_NOT_FOUND
            )

        cart = request.user.carts.filter(status="active").first()
        if not cart:
            return Response(
                {"error": "No active cart found"}, status=status.HTTP_400_BAD_REQUEST
            )

        is_valid, message = CouponService.validate_coupon(coupon, request.user, cart)

        if not is_valid:
            return Response(
                {"error": message}, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        discount = CouponService.calculate_discount(coupon, cart)
        cart.applied_coupon = coupon
        cart.coupon_discount = discount
        cart.save()

        return Response(
            {
                "coupon": CouponSerializer(coupon).data,
                "applied_discount": str(discount),
                "cart_total": str(cart.total),
            }
        )

    @extend_schema(
        summary="Remove coupon from cart",
        description="Remove the currently applied coupon from the user's active cart",
        request=None,
    )
    @action(detail=False, methods=["post"])
    def remove(self, request):
        """Remove coupon from cart."""
        cart = request.user.carts.filter(status="active").first()
        if not cart:
            return Response(
                {"error": "No active cart found"}, status=status.HTTP_400_BAD_REQUEST
            )

        cart.applied_coupon = None
        cart.coupon_discount = 0
        cart.save()

        return Response({"message": "Coupon removed successfully"})
