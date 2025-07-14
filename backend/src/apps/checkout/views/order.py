from apps.common.models import BaseViewSet
from drf_spectacular.utils import extend_schema
from apps.checkout.models.order import Order
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles, get_user_role
from apps.checkout.serializers.order import OrderSerializer, OrderDetailSerializer
from drf_spectacular.utils import inline_serializer
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.checkout.filters import OrderFilter


class OrderViewSet(BaseViewSet):
    """Orders: users read their own; employees/admins full CRUD across all."""

    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    filterset_class = OrderFilter
    search_fields = [
        "order_number",
        "status",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "shipping_method__name",
        "shipping_method__courier__name",
        "applied_coupon__code",
        "applied_coupon__description",
    ]
    ordering_fields = [
        "id",
        "order_number",
        "status",
        "subtotal",
        "shipping_cost",
        "coupon_discount",
        "total",
        "created_at",
        "updated_at",
        "shipped_at",
        "delivered_at",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
        "shipping_method__name",
        "applied_coupon__code",
    ]
    ordering = ["-created_at"]

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
                name="OrdersListResponse", fields={"results": OrderSerializer(many=True)}
            ),
        },
    )
    def list(self, request, *args, **kwargs):
        """List orders for the current user."""
        return super().list(request, *args, **kwargs)
