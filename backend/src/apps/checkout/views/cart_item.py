from apps.common.models import BaseViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.checkout.models import Cart, CartItem
from apps.checkout.serializers import (
    CartItemSerializer,
    CartItemCreateSerializer,
    CartItemQuantitySerializer,
    CartItemUpdateQuantitySerializer,
)


class CartItemViewSet(BaseViewSet):
    """ViewSet for CartItem model with CRUD operations."""

    serializer_class = CartItemSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "product__name",
        "product__sku",
        "product__description",
        "product__category__name",
        "product__manufacturer__name",
        "cart__user__email",
        "cart__user__username",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "quantity",
        "unit_price",
        "total_price",
        "product__name",
        "product__sku",
        "product__price",
        "cart__user__email",
        "cart__status",
    ]
    ordering = ["created_at"]
    pagination_class = None

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        """Filter queryset to user's cart items only."""
        return CartItem.objects.filter(cart__user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return CartItemCreateSerializer
        return CartItemSerializer

    def perform_create(self, serializer):
        """Set cart when creating item."""
        cart = Cart.get_or_create_active_cart(self.request.user)
        serializer.save(cart=cart)

    @action(detail=True, methods=["post"])
    def increase_quantity(self, request, pk=None):
        """Increase item quantity."""
        item = self.get_object()

        serializer = CartItemQuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]

        new_quantity = item.quantity + amount
        if new_quantity > item.product.stock_quantity:
            from rest_framework import status
            return Response(
                {
                    "error": "Insufficient stock",
                    "detail": f"Requested quantity ({new_quantity}) exceeds available stock ({item.product.stock_quantity})",
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "requested_quantity": new_quantity,
                    "available_stock": item.product.stock_quantity,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        item.increase_quantity(amount)
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def decrease_quantity(self, request, pk=None):
        """Decrease item quantity."""
        item = self.get_object()

        serializer = CartItemQuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]

        new_quantity = item.quantity - amount
        if new_quantity < 0:
            from rest_framework import status
            return Response(
                {
                    "error": "Invalid quantity",
                    "detail": f"Cannot decrease quantity below 0. Current: {item.quantity}, Decrease: {amount}",
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "current_quantity": item.quantity,
                    "decrease_amount": amount,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        item.decrease_quantity(amount)
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def update_quantity(self, request, pk=None):
        """Update item quantity."""
        item = self.get_object()

        serializer = CartItemUpdateQuantitySerializer(
            data=request.data, context={"cart_item": item}
        )
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data["quantity"]

        item.update_quantity(quantity)
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)
