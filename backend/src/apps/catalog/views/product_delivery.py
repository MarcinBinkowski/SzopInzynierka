from apps.common.models import BaseViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.catalog.models import ProductDelivery
from apps.catalog.serializers import ProductDeliverySerializer
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles


class ProductDeliveryViewSet(BaseViewSet):
    queryset = ProductDelivery.objects.select_related("supplier", "product")
    serializer_class = ProductDeliverySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id"]

    search_fields = [
        "supplier__name",
        "supplier__contact_email",
        "supplier__phone",
        "product__name",
        "product__sku",
        "product__description",
        "notes",
    ]
    filterset_fields = ["id"]
    ordering_fields = [
        "id",
        "delivery_date",
        "quantity",
        "unit_cost",
        "total_cost",
        "status",
        "created_at",
        "updated_at",
        "supplier__name",
        "supplier__contact_email",
        "product__name",
        "product__sku",
    ]
    ordering = ["-delivery_date"]

    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN})]
