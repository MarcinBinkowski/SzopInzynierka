from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter

from apps.checkout.models import Cart, CartItem
from apps.checkout.serializers import (
    CartSerializer, CartListSerializer, CartItemSerializer, CartItemCreateSerializer,
    CartItemQuantitySerializer, CartItemUpdateQuantitySerializer,
    CartShippingAddressSerializer, CartShippingMethodSerializer
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
        cart.items.all().delete()
        
        # Return the updated cart data using the same serializer
        response_serializer = CartSerializer(cart, context={"request": request})
        return Response(response_serializer.data)

    @action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        """Get cart summary with totals."""
        cart = self.get_object()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def set_shipping_address(self, request, pk=None):
        """Set shipping address for cart."""
        cart = self.get_object()
        
        serializer = CartShippingAddressSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        address_id = serializer.validated_data['address_id']
        
        try:
            from apps.profile.models import Address
            address = Address.objects.get(
                id=address_id,
                profile__user=request.user,
                address_type=Address.AddressType.SHIPPING
            )
            cart.shipping_address = address
            cart.save()
            
            response_serializer = CartSerializer(cart, context={"request": request})
            return Response(response_serializer.data)
            
        except Address.DoesNotExist:
            return Response(
                {"error": "Shipping address not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def set_shipping_method(self, request, pk=None):
        """Set shipping method for cart."""
        cart = self.get_object()
        
        serializer = CartShippingMethodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        shipping_method_id = serializer.validated_data['shipping_method_id']
        
        try:
            from apps.checkout.models import ShippingMethod
            shipping_method = ShippingMethod.objects.get(id=shipping_method_id)
            cart.shipping_method = shipping_method
            cart.save()
            
            response_serializer = CartSerializer(cart, context={"request": request})
            return Response(response_serializer.data)
            
        except ShippingMethod.DoesNotExist:
            return Response(
                {"error": "Shipping method not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current user's active cart."""
        cart = Cart.get_or_create_active_cart(request.user)
        serializer = CartSerializer(cart, context={"request": request})
        response = Response(serializer.data)
        return response


class CartItemViewSet(viewsets.ModelViewSet):
    """ViewSet for CartItem model with CRUD operations."""

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "quantity", "unit_price"]
    ordering = ["created_at"]
    pagination_class = None

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
        amount = serializer.validated_data['amount']
        
        item.increase_quantity(amount)
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def decrease_quantity(self, request, pk=None):
        """Decrease item quantity."""
        item = self.get_object()
        
        serializer = CartItemQuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']
        
        item.decrease_quantity(amount)
        # Always return the item data, even if quantity is 0
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def update_quantity(self, request, pk=None):
        """Update item quantity."""
        item = self.get_object()
        
        serializer = CartItemUpdateQuantitySerializer(
            data=request.data, 
            context={'cart_item': item}
        )
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']
        
        item.update_quantity(quantity)
        # Always return the item data, even if quantity is 0
        response_serializer = self.get_serializer(item)
        return Response(response_serializer.data)
