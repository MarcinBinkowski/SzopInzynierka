from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from apps.catalog.models import ProductImage
from apps.catalog.serializers import (
    ProductImageSerializer,
)
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class ProductImageViewSet(viewsets.ModelViewSet):
    """ViewSet for ProductImage model with CRUD operations."""

    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["product", "is_primary"]
    ordering_fields = ["sort_order", "created_at"]
    ordering = ["sort_order", "created_at"]
    pagination_class = None

    def get_queryset(self):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset()
        return queryset.select_related("product")

    @action(detail=True, methods=["post"])
    def set_primary(self, request, pk: int = None) -> Response:
        """Set this image as primary for its product."""
        image = self.get_object()

        ProductImage.objects.filter(product=image.product, is_primary=True).exclude(
            pk=image.pk
        ).update(is_primary=False)

        image.is_primary = True
        image.save()

        serializer = self.get_serializer(image)
        return Response(serializer.data)
