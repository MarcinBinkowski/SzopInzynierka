from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

from apps.checkout.models.coupon import Coupon
from apps.checkout.serializers.coupon import CouponSerializer
from apps.checkout.services.coupon_service import CouponService


class CouponValidationRequestSerializer(serializers.Serializer):
    """Serializer for coupon validation request."""
    code = serializers.CharField(max_length=20, help_text="Coupon code to validate")


class CouponValidationResponseSerializer(serializers.Serializer):
    """Serializer for coupon validation response."""
    coupon = CouponSerializer()
    applied_discount = serializers.CharField()
    cart_total = serializers.CharField()


class CouponRemoveRequestSerializer(serializers.Serializer):
    """Serializer for coupon removal request (no data needed)."""
    pass


class CouponRemoveResponseSerializer(serializers.Serializer):
    """Serializer for coupon removal response."""
    message = serializers.CharField()


class CouponViewSet(viewsets.ModelViewSet):
    """Full CRUD ViewSet for coupon management."""
    
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]  # Only admins can manage coupons
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    
    # Public endpoints (for users)
    @extend_schema(
        summary="Get active coupons",
        description="Get list of active coupons for users",
        responses={200: CouponSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def active(self, request):
        """Get list of active coupons for users."""
        now = timezone.now()
        coupons = Coupon.objects.filter(
            valid_from__lte=now,
            valid_until__gte=now
        )
        serializer = self.get_serializer(coupons, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Validate and apply coupon",
        description="Validate and apply coupon to cart",
        request=CouponValidationRequestSerializer,
        responses={200: CouponValidationResponseSerializer}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validate(self, request):
        """Validate and apply coupon to cart."""
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Coupon code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code.upper())
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)
        
        cart = request.user.carts.filter(status='active').first()
        if not cart:
            return Response({'error': 'No active cart found'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_valid, message = CouponService.validate_coupon(coupon, request.user, cart)
        
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        discount = CouponService.calculate_discount(coupon, cart)
        cart.applied_coupon = coupon
        cart.coupon_discount = discount
        cart.save()
        
        return Response({
            'coupon': CouponSerializer(coupon).data,
            'applied_discount': str(discount),
            'cart_total': str(cart.total)
        })
    
    @extend_schema(
        summary="Remove coupon from cart",
        description="Remove applied coupon from cart",
        request=CouponRemoveRequestSerializer,
        responses={200: CouponRemoveResponseSerializer}
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remove(self, request):
        """Remove coupon from cart."""
        cart = request.user.carts.filter(status='active').first()
        if not cart:
            return Response({'error': 'No active cart found'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart.applied_coupon = None
        cart.coupon_discount = 0
        cart.save()
        
        return Response({'message': 'Coupon removed successfully'}) 