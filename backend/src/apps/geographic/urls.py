from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.geographic.views import CountryViewSet

router = DefaultRouter()
router.register(r"countries", CountryViewSet, basename="country")

app_name = "geographic"

urlpatterns = [
    path("", include(router.urls)),
]
