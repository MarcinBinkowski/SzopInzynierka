import pdb
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
from django.db.models import Case, When, F, DecimalField
from django.db.models.functions import Lower
from django.utils import timezone


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model with advanced CRUD operations."""

    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name"]
    ordering_fields = ["name_lower", "price", "original_price", "created_at", "updated_at", "effective_price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Optimize queryset based on action and user permissions."""
        queryset = super().get_queryset()

        queryset = queryset.select_related("category").prefetch_related(
            "tags", "images"
        )

        now = timezone.now()
        queryset = queryset.annotate(
            effective_price=Case(
                When(sale_start__lte=now, sale_end__gte=now, then=F("price")),
                default=F("original_price"),
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            name_lower=Lower("name")
        )
        if not self.request.user.is_staff:
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

