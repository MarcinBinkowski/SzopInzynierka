from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema
from apps.checkout.models.order import Order
from apps.checkout.serializers.order import OrderSerializer, OrderDetailSerializer
from drf_spectacular.utils import inline_serializer
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing orders (read-only)."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        """Return orders for the current user."""
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use appropriate serializer for different actions."""
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderSerializer
    
    @extend_schema(
        summary="Get order details",
        description="Retrieve details of a specific order",
        responses={
            200: OrderDetailSerializer,
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Get current user's orders",
        description="Retrieve a list of orders for the current user",
        responses={
            200: inline_serializer(
                name='OrdersListResponse',
                fields={
                    'orders': OrderSerializer(many=True)
                }
            ),
        }
    )
    def list(self, request, *args, **kwargs):
        """List orders for the current user."""
        return super().list(request, *args, **kwargs)