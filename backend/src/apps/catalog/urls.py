from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import (
    CategoryViewSet,
    ManufacturerViewSet,
    ProductViewSet,
    ProductImageViewSet,
    TagViewSet,
    WishlistViewSet,
    NotificationPreferenceViewSet,
    NotificationHistoryViewSet,
    SupplierViewSet,
    ProductDeliveryViewSet,
)

app_name = "catalog"

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"manufacturers", ManufacturerViewSet, basename="manufacturer")
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"images", ProductImageViewSet, basename="image")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")
router.register(
    r"notifications/preferences",
    NotificationPreferenceViewSet,
    basename="notification-preference",
)
router.register(
    r"notifications/history",
    NotificationHistoryViewSet,
    basename="notification-history",
)
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"deliveries", ProductDeliveryViewSet, basename="product-delivery")

urlpatterns = [
    path("", include(router.urls)),
]
