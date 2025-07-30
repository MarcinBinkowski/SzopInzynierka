from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import (
    CategoryViewSet,
    ManufacturerViewSet,
    ProductViewSet,
    ProductImageViewSet,
    TagViewSet,
    WishlistViewSet,
)

app_name = "catalog"

# Single router with clean resource names
router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"manufacturers", ManufacturerViewSet, basename="manufacturer")
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"images", ProductImageViewSet, basename="image")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("", include(router.urls)),
]
