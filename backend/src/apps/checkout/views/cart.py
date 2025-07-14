from apps.common.models import BaseViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.checkout.models import Cart
from apps.checkout.serializers import (
    CartSerializer,
    CartListSerializer,
)


class CartViewSet(BaseViewSet):
    """ViewSet for Cart model with CRUD operations."""

    serializer_class = CartSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "status",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "shipping_address__address_line_1",
        "shipping_address__city",
        "shipping_method__name",
        "applied_coupon__code",
    ]
    ordering_fields = [
        "status",
        "created_at",
        "updated_at",
        "user__email",
        "shipping_method__name",
        "applied_coupon__code",
    ]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        """Filter queryset to user's carts only."""
        return Cart.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return CartListSerializer
        return CartSerializer

    def perform_create(self, serializer):
        """Set user when creating cart."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current user's active cart."""
        cart = Cart.get_or_create_active_cart(request.user)
        serializer = CartSerializer(cart, context={"request": request})
        response = Response(serializer.data)
        return response
