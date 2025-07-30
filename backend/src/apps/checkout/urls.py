from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.checkout.views import CartViewSet, CartItemViewSet

app_name = "checkout"

router = DefaultRouter()
router.register(r"carts", CartViewSet, basename="cart")
router.register(r"items", CartItemViewSet, basename="cart-item")

urlpatterns = [
    path("", include(router.urls)),
]
