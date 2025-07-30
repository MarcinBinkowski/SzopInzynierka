from django.urls import path

from apps.payments.views import (
    CreateCheckoutSessionView,
    ConfirmPaymentIntentView,
)

app_name = "payments"

urlpatterns = [
    path("create_checkout_session/", CreateCheckoutSessionView.as_view(), name="create_checkout_session"),
    path("confirm_payment_intent/", ConfirmPaymentIntentView.as_view(), name="confirm_payment_intent"),
] 