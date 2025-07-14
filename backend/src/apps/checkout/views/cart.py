from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter

from apps.checkout.models import Cart, CartItem
from apps.checkout.serializers import (
    CartSerializer,
    CartListSerializer,
    CartItemSerializer,
    CartItemCreateSerializer,
)


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for Cart model with CRUD operations."""

    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

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

    @action(detail=True, methods=["post"])
    def clear(self, request, pk=None):
        """Clear all items from cart."""
        cart = self.get_object()
        cart.clear()
        return Response({"message": "Cart cleared successfully"})

    @action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        """Get cart summary with totals."""
        cart = self.get_object()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)


class CartItemViewSet(viewsets.ModelViewSet):
    """ViewSet for CartItem model with CRUD operations."""

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "quantity", "unit_price"]
    ordering = ["created_at"]

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
        amount = int(request.data.get("amount", 1))
        item.increase_quantity(amount)
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def decrease_quantity(self, request, pk=None):
        """Decrease item quantity."""
        item = self.get_object()
        amount = int(request.data.get("amount", 1))
        item.decrease_quantity(amount)
        if item.quantity > 0:
            serializer = self.get_serializer(item)
            return Response(serializer.data)
        return Response({"message": "Item removed from cart"})

    @action(detail=True, methods=["post"])
    def update_quantity(self, request, pk=None):
        """Update item quantity."""
        item = self.get_object()
        quantity = int(request.data.get("quantity", 1))
        item.update_quantity(quantity)
        if item.quantity > 0:
            serializer = self.get_serializer(item)
            return Response(serializer.data)
        return Response({"message": "Item removed from cart"})
