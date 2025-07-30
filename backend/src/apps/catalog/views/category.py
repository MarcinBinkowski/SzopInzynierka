from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.catalog.models import Category
from apps.catalog.serializers import (
    CategorySerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model with CRUD operations."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    pagination_class = None

    def get_queryset(self):
        """Optimize queryset based on action."""
        queryset = super().get_queryset()

        if self.action in ["list", "retrieve"]:
            # Prefetch products for product count calculation
            queryset = queryset.prefetch_related("products")

        # Filter active categories for non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset

    @action(detail=True, methods=["get"])
    def products(self, request, slug: str = None) -> Response:
        """Get all products in this category."""
        category = self.get_object()
        products = category.products.available()

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
