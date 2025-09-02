from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from drf_spectacular.utils import extend_schema

from apps.checkout.models.coupon import Coupon
from apps.checkout.serializers.coupon import (
    CouponSerializer,
    CouponValidationRequestSerializer,
    CouponValidationResponseSerializer,
    CouponRemoveRequestSerializer,
    CouponRemoveResponseSerializer,
)
from apps.checkout.services.coupon_service import CouponService


class CouponViewSet(viewsets.ModelViewSet):
    """Full CRUD ViewSet for coupon management."""

    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def get_queryset(self):
        return self.queryset

    def list(self, request, *args, **kwargs):
        """Override list to explicitly deny access to non-admins."""
        role = get_user_role(getattr(self.request, "user", None))
        if role not in [Profile.Role.ADMIN, Profile.Role.EMPLOYEE]:
            return Response(
                {"error": "Only administrators can list coupons"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Validate and apply coupon",
        description="Validate and apply coupon to cart",
        request=CouponValidationRequestSerializer,
        responses={200: CouponValidationResponseSerializer},
    )
    @action(
        detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def validate(self, request):
        """Validate and apply coupon to cart."""
        code = request.data.get("code")
        if not code:
            return Response(
                {"error": "Coupon code is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            coupon = Coupon.objects.get(code=code.upper())
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
        description="Remove applied coupon from cart",
        request=CouponRemoveRequestSerializer,
        responses={200: CouponRemoveResponseSerializer},
    )
    @action(
        detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
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
