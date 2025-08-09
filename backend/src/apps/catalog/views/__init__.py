from apps.catalog.views.product import ProductViewSet
from apps.catalog.views.category import CategoryViewSet
from apps.catalog.views.manufacturer import ManufacturerViewSet
from apps.catalog.views.tag import TagViewSet
from apps.catalog.views.product_image import ProductImageViewSet
from apps.catalog.views.wishlist import WishlistViewSet
from apps.catalog.views.notification import (
    NotificationPreferenceViewSet,
    NotificationHistoryViewSet,
)

__all__ = [
    "ProductViewSet",
    "CategoryViewSet",
    "ManufacturerViewSet",
    "TagViewSet",
    "ProductImageViewSet",
    "WishlistViewSet",
    "NotificationPreferenceViewSet",
    "NotificationHistoryViewSet",
]
