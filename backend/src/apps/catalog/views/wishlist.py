from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.catalog.models.wishlist import WishlistItem
from apps.catalog.serializers import (
    WishlistItemSerializer,
    WishlistItemCreateSerializer,
    WishlistCheckSerializer,
)


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user's wishlist."""

    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]
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
        """Set the user when creating a wishlist item."""
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=["wishlist"],
        parameters=[
            OpenApiParameter(
                name="in_stock", type=bool, location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name="on_sale", type=bool, location=OpenApiParameter.QUERY
            ),
        ],
        description="Filter wishlist items by stock and sale status",
        responses={200: WishlistItemSerializer},
    )
    @action(detail=False, methods=["get"])
    def filtered(self, request: Request) -> Response:
        """Get filtered wishlist items."""
        queryset = self.get_queryset()

        # Filter by stock status
        in_stock = request.query_params.get("in_stock")
        if in_stock is not None:
            in_stock_bool = in_stock.lower() == "true"
            if in_stock_bool:
                queryset = queryset.filter(product__stock_quantity__gt=0)
            else:
                queryset = queryset.filter(product__stock_quantity=0)

        # Filter by sale status
        on_sale = request.query_params.get("on_sale")
        if on_sale is not None:
            on_sale_bool = on_sale.lower() == "true"
            if on_sale_bool:
                queryset = queryset.filter(product__is_on_sale=True)
            else:
                queryset = queryset.filter(product__is_on_sale=False)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=["wishlist"],
        parameters=[
            OpenApiParameter(
                name="product_id",
                type=int,
                location=OpenApiParameter.PATH,
                required=True,
            )
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
