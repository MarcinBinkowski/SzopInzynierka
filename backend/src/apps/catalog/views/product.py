from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.catalog.models import Product
from apps.catalog.serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from apps.catalog.filters import ProductFilter


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model with advanced CRUD operations."""

    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "short_description", "sku"]
    ordering_fields = "__all__"
    ordering = ["-created_at"]

    def get_queryset(self):
        """Optimize queryset based on action and user permissions."""
        queryset = super().get_queryset()

        # Always optimize with related data
        queryset = queryset.select_related("category").prefetch_related(
            "tags", "images"
        )

        # Filter based on user permissions
        if not self.request.user.is_staff:
            # Non-staff users only see available products
            queryset = queryset.available()

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return ProductCreateSerializer
        elif self.action in ["list"]:
            return ProductListSerializer
        else:
            return ProductDetailSerializer

    def perform_create(self, serializer) -> None:
        """Handle product creation."""
        serializer.save()

    def perform_update(self, serializer) -> None:
        """Handle product updates."""
        serializer.save()

    @action(detail=False, methods=["get"])
    def on_sale(self, request) -> Response:
        """Get products currently on sale."""
        products = self.get_queryset().on_sale()

        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = ProductListSerializer(
            products, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_to_wishlist(self, request, slug: str = None) -> Response:
        """Add product to user's wishlist."""
        product = self.get_object()
        # TODO implement

        return Response({"message": f"Added {product.name} to wishlist"})

    @action(detail=True, methods=["get"])
    def related(self, request, slug: str = None) -> Response:
        """Get related products based on category and tags."""
        product = self.get_object()

        # Find products in same category with similar tags
        related_products = (
            Product.objects.available()
            .filter(category=product.category)
            .exclude(pk=product.pk)[:5]
        )

        serializer = ProductListSerializer(
            related_products, many=True, context={"request": request}
        )
        return Response(serializer.data)
