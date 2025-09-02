from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from apps.checkout.models.order import Order
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers.order import OrderSerializer, OrderDetailSerializer
from drf_spectacular.utils import inline_serializer


class OrderViewSet(viewsets.ModelViewSet):
    """Orders: users read their own; employees/admins full CRUD across all."""

    serializer_class = OrderSerializer

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    def get_queryset(self):
        role = get_user_role(getattr(self.request, "user", None))
        if role in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use appropriate serializer for different actions."""
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderSerializer

    @extend_schema(
        summary="Get order details",
        description="Retrieve details of a specific order",
        responses={
            200: OrderDetailSerializer,
        },
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Get current user's orders",
        description="Retrieve a list of orders for the current user",
        responses={
            200: inline_serializer(
                name="OrdersListResponse", fields={"orders": OrderSerializer(many=True)}
            ),
        },
    )
    def list(self, request, *args, **kwargs):
        """List orders for the current user."""
        return super().list(request, *args, **kwargs)
