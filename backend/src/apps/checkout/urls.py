from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.checkout.views import (
    CartViewSet,
    CartItemViewSet,
    CreateCheckoutSessionView,
    ConfirmPaymentIntentView,
    ShippingMethodViewSet,
    CourierViewSet,
    ShipmentViewSet,
    OrderProcessingNoteViewSet,
    PaymentViewSet,
    CouponRedemptionViewSet,
)
from apps.checkout.views.order import OrderViewSet
from apps.checkout.views.analytics import DashboardAnalyticsView, OrdersExportCsvView
from apps.checkout.views.coupon import CouponViewSet
from apps.checkout.views.invoice import InvoiceTemplateViewSet, InvoiceViewSet

app_name = "checkout"

router = DefaultRouter()
router.register(r"carts", CartViewSet, basename="cart")
router.register(r"items", CartItemViewSet, basename="cart-item")
router.register(r"shipping-methods", ShippingMethodViewSet, basename="shipping-method")
router.register(r"couriers", CourierViewSet, basename="courier")
router.register(r"shipments", ShipmentViewSet, basename="shipment")
router.register(
    r"order-notes", OrderProcessingNoteViewSet, basename="order-processing-note"
)
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(
    r"coupon-redemptions", CouponRedemptionViewSet, basename="coupon-redemption"
)
router.register(r"coupons", CouponViewSet, basename="coupon")
router.register(
    r"invoice-templates", InvoiceTemplateViewSet, basename="invoice-template"
)
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("orders/export.csv", OrdersExportCsvView.as_view(), name="orders_export_csv"),
    path("dashboard/", DashboardAnalyticsView.as_view(), name="dashboard_analytics"),
    path("", include(router.urls)),
    path(
        "create_checkout_session/",
        CreateCheckoutSessionView.as_view(),
        name="create_checkout_session",
    ),
    path(
        "confirm_payment_intent/",
        ConfirmPaymentIntentView.as_view(),
        name="confirm_payment_intent",
    ),
]
