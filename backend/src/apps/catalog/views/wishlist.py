from apps.common.models import BaseViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.catalog.models.wishlist import WishlistItem
from apps.catalog.serializers import (
    WishlistItemSerializer,
    WishlistItemCreateSerializer,
    WishlistCheckSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend


class WishlistViewSet(BaseViewSet):
    """ViewSet for managing user's wishlist."""

    serializer_class = WishlistItemSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]
    search_fields = [
        "product__name",
        "product__sku",
        "product__description",
        "product__category__name",
        "product__manufacturer__name",
    ]
    ordering_fields = [
        "id",
        "created_at",
        "updated_at",
        "product__name",
        "product__sku",
        "product__price",
        "product__category__name",
        "product__manufacturer__name",
    ]
    ordering = ["-created_at"]
    pagination_class = None

    @extend_schema(
        tags=["wishlist"],
        description="List all wishlist items for the current user",
        responses={200: WishlistItemSerializer},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=["wishlist"],
        description="Create a new wishlist item",
        request=WishlistItemCreateSerializer,
        responses={201: WishlistItemSerializer},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=["wishlist"],
        description="Retrieve a specific wishlist item",
        responses={200: WishlistItemSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=["wishlist"], description="Delete a wishlist item", responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=["wishlist"],
        description="Update a wishlist item",
        request=WishlistItemSerializer,
        responses={200: WishlistItemSerializer},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=["wishlist"],
        description="Partially update a wishlist item",
        request=WishlistItemSerializer,
        responses={200: WishlistItemSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    def get_queryset(self):
        """Return only the current user's wishlist items."""
        return WishlistItem.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return WishlistItemCreateSerializer
        return WishlistItemSerializer

    def perform_create(self, serializer):
        """Automatically set the user when creating a wishlist item."""
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=["wishlist"],
        parameters=[
            OpenApiParameter(
                name="product_id",
                type=int,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
        responses={200: WishlistCheckSerializer},
        description="Check if a product is in wishlist",
    )
    @action(detail=False, methods=["get"], url_path="check/(?P<product_id>[0-9]+)")
    def check_product(self, request: Request, product_id: int) -> Response:
        """Check if a product is in the user's wishlist."""
        try:
            wishlist_item = WishlistItem.objects.get(
                user=request.user, product_id=product_id
            )
            data = {
                "product_id": product_id,
                "is_in_wishlist": True,
                "wishlist_item_id": wishlist_item.id,
            }
        except WishlistItem.DoesNotExist:
            data = {
                "product_id": product_id,
                "is_in_wishlist": False,
                "wishlist_item_id": None,
            }

        serializer = WishlistCheckSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
