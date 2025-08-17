from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.checkout.views import CartViewSet, CartItemViewSet, CreateCheckoutSessionView, ConfirmPaymentIntentView, ShippingMethodViewSet
from apps.checkout.views.order import OrderViewSet
from apps.checkout.views.coupon import CouponViewSet
from apps.checkout.views.invoice import InvoiceTemplateViewSet, InvoiceViewSet

app_name = "checkout"

router = DefaultRouter()
router.register(r"carts", CartViewSet, basename="cart")
router.register(r"items", CartItemViewSet, basename="cart-item")
router.register(r"shipping-methods", ShippingMethodViewSet, basename="shipping-method")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"coupons", CouponViewSet, basename="coupon")
router.register(r"invoice-templates", InvoiceTemplateViewSet, basename="invoice-template")
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
    path("create_checkout_session/", CreateCheckoutSessionView.as_view(), name="create_checkout_session"),
    path("confirm_payment_intent/", ConfirmPaymentIntentView.as_view(), name="confirm_payment_intent"),
]
