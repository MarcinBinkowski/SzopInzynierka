from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response

from apps.catalog.models import Tag
from apps.catalog.serializers import (
    ProductListSerializer,
    TagSerializer,
)
from apps.profile.models import Profile
from apps.profile.permissions import RolesAllowed


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet for Tag model with CRUD operations."""

    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        # Read-only for authenticated users; writes require admin
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [RolesAllowed({Profile.Role.ADMIN})]

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=True, methods=["get"])
    def products(self, request, slug: str = None) -> Response:
        """Get all products with this tag."""
        tag = self.get_object()
        products = tag.product_set.available()

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
