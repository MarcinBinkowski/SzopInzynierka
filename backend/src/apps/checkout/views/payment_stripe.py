from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from drf_spectacular.utils import extend_schema, extend_schema_serializer
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
    

    def get_serializer_class(self):
        return CreateCheckoutSessionSerializer


    def get_permissions(self):
        return [IsAuthenticated()]

    @extend_schema(
        request=CreateCheckoutSessionSerializer,
        responses={
            200: CheckoutSessionResponseSerializer,
        },
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

            unavailable_items = []
            for item in cart.items.all():
                if not item.stock_available:
                    unavailable_items.append({
                        "product_id": item.product.id,
                        "product_name": item.product.name,
                        "requested_quantity": item.quantity,
                        "available_stock": item.product.stock_quantity,
                    })
            
            if unavailable_items:
                return Response(
                    {
                        "error": "Some items are no longer available in the requested quantity",
                        "unavailable_items": unavailable_items,
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

            payment_intent = stripe.PaymentIntent.create(
                amount=int(cart.total * 100),
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

    def get_serializer_class(self):
        return ConfirmPaymentSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    @extend_schema(
        request=ConfirmPaymentSerializer,
        responses={
            200: PaymentConfirmationResponseSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}},
            500: {"type": "object", "properties": {"error": {"type": "string"}}},
        },
        tags=["checkout"],
    )
    def post(self, request):
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment_intent_id = serializer.validated_data["session_id"]

        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.metadata.get("user_id") != str(request.user.id):
                return Response(
                    {"error": "Invalid PaymentIntent for this user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment = get_object_or_404(
                Payment.objects.filter(
                    stripe_payment_intent_id=payment_intent_id, user=request.user
                )
            )

            if payment_intent.status == "succeeded":
                payment.status = Payment.PaymentStatus.COMPLETED
                payment.save()

                cart_id = payment_intent.metadata.get("cart_id")
                if cart_id:
                    cart = get_object_or_404(
                        Cart.objects.filter(id=cart_id, user=request.user)
                    )

                    order = Order.create_from_cart(cart, payment)
                    logger.info(
                        f"Successfully created order {order.order_number} from cart {cart.id}"
                    )
                    order_items_count = order.items.count()
                    cart_items_count = cart.items.count()
                    logger.info(
                        f"Order {order.order_number}: {order_items_count} items created from {cart_items_count} cart items"
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
                    "amount_paid": payment_intent.amount / 100,
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
