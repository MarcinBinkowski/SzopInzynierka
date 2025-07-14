from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Apps
    path("api/profile/", include("apps.profile.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/geographic/", include("apps.geographic.urls")),
    path("api/checkout/", include("apps.checkout.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Also serve static files if needed
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
