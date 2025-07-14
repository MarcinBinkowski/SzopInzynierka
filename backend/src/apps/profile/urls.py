from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.profile.views import ProfileViewSet, AddressViewSet

app_name = "profile"

router = DefaultRouter()
router.register(r"profiles", ProfileViewSet, basename="profile")
router.register(r"addresses", AddressViewSet, basename="address")

urlpatterns = [
    path("", include(router.urls)),
]
