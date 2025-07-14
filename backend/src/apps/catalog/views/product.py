from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.catalog.models import Product
from apps.catalog.serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from apps.catalog.filters import ProductFilter
from django.db.models.functions import Lower
from apps.profile.models import Profile
from apps.profile.permissions import get_user_role, ReadOnlyOrRoles


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model with advanced CRUD operations."""

    queryset = Product.objects.all()

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = [
        "name__icontains",
        "slug__icontains",
        "description__icontains",
        "short_description__icontains",
        "sku__icontains",
        "category__name__icontains",
        "manufacturer__name__icontains",
        "tags__name__icontains",
    ]
    ordering_fields = [
        "id",
        "name",
        "slug",
        "price",
        "original_price",
        "sku",
        "stock_quantity",
        "is_visible",
        "is_on_sale",
        "created_at",
        "updated_at",
        "category__name",
        "manufacturer__name",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Optimize queryset based on action and user permissions."""
        queryset = super().get_queryset()

        queryset = queryset.select_related("category").prefetch_related(
            "tags", "images"
        )

        queryset = queryset.annotate(
            name_lower=Lower("name"),
        )
        role = get_user_role(getattr(self.request, "user", None))
        if role not in {Profile.Role.ADMIN, Profile.Role.EMPLOYEE}:
            queryset = queryset.filter(is_visible=True)
        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return ProductCreateSerializer
        elif self.action in ["list"]:
            return ProductListSerializer
        else:
            return ProductDetailSerializer
