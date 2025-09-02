from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from drf_spectacular.utils import extend_schema
import stripe
import logging

from apps.checkout.models import Cart, Payment, Order
from apps.checkout.serializers import (
    CreateCheckoutSessionSerializer,
    ConfirmPaymentSerializer,
    CheckoutSessionResponseSerializer,
    PaymentConfirmationResponseSerializer,
)

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    """Create a Stripe Checkout session for a cart."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CreateCheckoutSessionSerializer,
        responses={200: CheckoutSessionResponseSerializer},
        tags=["checkout"],
    )
    def post(self, request):
        serializer = CreateCheckoutSessionSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        currency = data["currency"]

        try:
            cart = Cart.get_or_create_active_cart(request.user)

            if cart.is_empty():
                return Response(
                    {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Set shipping address and method on cart using serializer
            cart = serializer.set_shipping_on_cart(cart)

            if not cart.shipping_address:
                return Response(
                    {"error": "Shipping address is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not cart.shipping_method:
                return Response(
                    {"error": "Shipping method is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create PaymentIntent for PaymentSheet
            payment_intent = stripe.PaymentIntent.create(
                amount=int(cart.total * 100),  # Convert to cents
                currency=currency,
                automatic_payment_methods={
                    "enabled": True,
                },
                metadata={
                    "cart_id": cart.id,
                    "user_id": request.user.id,
                    "item_count": cart.item_count,
                    "customer_email": request.user.email if request.user.email else "",
                },
            )

            payment = Payment.objects.create(
                user=request.user,
                amount=cart.total,
                status=Payment.PaymentStatus.PENDING,
                stripe_payment_intent_id=payment_intent.id,
                description=f"Payment for cart {cart.id}",
                metadata={
                    "cart_id": cart.id,
                    "payment_intent_id": payment_intent.id,
                    "item_count": cart.item_count,
                    "currency": currency,
                },
            )

            logger.info(f"Created PaymentIntent {payment_intent.id} for cart {cart.id}")

            response_data = {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "payment_id": payment.id,
            }
            serializer = CheckoutSessionResponseSerializer(response_data)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return Response(
                {"error": "Failed to create checkout session"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ConfirmPaymentIntentView(APIView):
    """Confirm PaymentIntent and create order after successful PaymentSheet payment."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ConfirmPaymentSerializer,
        responses={200: PaymentConfirmationResponseSerializer},
        tags=["checkout"],
    )
    def post(self, request):
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment_intent_id = serializer.validated_data[
            "session_id"
        ]  # Reusing session_id field for payment_intent_id

        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.metadata.get("user_id") != str(request.user.id):
                return Response(
                    {"error": "Invalid PaymentIntent for this user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get the payment record
            payment = get_object_or_404(
                Payment.objects.filter(
                    stripe_payment_intent_id=payment_intent_id, user=request.user
                )
            )

            if payment_intent.status == "succeeded":
                # Update payment status
                payment.status = Payment.PaymentStatus.COMPLETED
                payment.save()

                # Get the cart
                cart_id = payment_intent.metadata.get("cart_id")
                if cart_id:
                    cart = get_object_or_404(
                        Cart.objects.filter(id=cart_id, user=request.user)
                    )

                    # Create order from cart
                    order = Order.create_from_cart(cart, payment)
                    logger.info(
                        f"Successfully created order {order.order_number} from cart {cart.id}"
                    )
                    cart.status = Cart.CartStatus.CONVERTED
                    cart.save()
                    cart.clear()
                    logger.info(f"Successfully cleared cart {cart.id}")

                logger.info(
                    f"PaymentIntent {payment_intent_id} confirmed and order {order.order_number} created for user {request.user.id}"
                )

                response_data = {
                    "success": True,
                    "payment_id": payment.id,
                    "order_number": order.order_number,
                    "message": "Payment confirmed and order created successfully",
                    "amount_paid": payment_intent.amount / 100,  # Convert from cents
                    "currency": payment_intent.currency,
                }
                serializer = PaymentConfirmationResponseSerializer(response_data)
                return Response(serializer.data)

            else:
                payment.status = Payment.PaymentStatus.FAILED
                payment.save()

                return Response(
                    {"error": f"Payment status is {payment_intent.status}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            logger.error(f"Error confirming PaymentIntent: {str(e)}")
            return Response(
                {"error": "Failed to confirm PaymentIntent"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
