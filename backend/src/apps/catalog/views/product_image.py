from django_filters.rest_framework import DjangoFilterBackend
from apps.common.models import BaseViewSet
from rest_framework.filters import OrderingFilter, SearchFilter
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.catalog.models import ProductImage
from apps.catalog.serializers import (
    ProductImageSerializer,
)
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class ProductImageViewSet(BaseViewSet):
    """ViewSet for ProductImage model with CRUD operations."""

    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id", "product"]
    search_fields = [
        "product__name",
        "product__sku",
        "product__description",
    ]
    ordering_fields = [
        "id",
        "sort_order",
        "is_primary",
        "created_at",
        "updated_at",
        "product__name",
        "product__sku",
        "product__price",
    ]
    ordering = ["sort_order", "created_at"]
    pagination_class = None

    def get_queryset(self):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset()
        return queryset.select_related("product")

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "image": {
                        "type": "string",
                        "format": "binary",
                        "description": "Image file to upload",
                    },
                    "product": {"type": "integer", "description": "Product ID"},
                    "is_primary": {
                        "type": "boolean",
                        "description": "Whether this is the primary product image",
                        "default": False,
                    },
                    "sort_order": {
                        "type": "integer",
                        "description": "Display order of images",
                        "default": 0,
                    },
                },
                "required": ["image", "product"],
            }
        },
        responses={201: ProductImageSerializer},
    )
    def create(self, request, *args, **kwargs):
        """Create a new product image with file upload."""
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Set image as primary",
        description="Set this image as primary for its product",
        request=None,
        responses={200: ProductImageSerializer},
    )
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
