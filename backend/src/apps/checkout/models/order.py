from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
import uuid

from apps.common.models import TimestampedModel
from apps.checkout.models.order_item import OrderItem
from django.db import transaction

User = get_user_model()


class Order(TimestampedModel):
    """Order model for completed purchases."""

    class OrderStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders",
        help_text="User who placed this order",
    )
    order_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique order number",
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        help_text="Current status of the order",
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Subtotal of all items",
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Shipping cost",
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total amount including shipping",
    )

    payment = models.OneToOneField(
        "Payment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order",
        help_text="Payment associated with this order",
    )
    shipping_address = models.ForeignKey(
        "profile.Address",
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="Shipping address for this order",
    )
    shipping_method = models.ForeignKey(
        "ShippingMethod",
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="Shipping method used for this order",
    )
    applied_coupon = models.ForeignKey(
        "Coupon",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        help_text="Applied coupon to this order",
    )
    coupon_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Discount amount from applied coupon",
    )

    notes = models.TextField(
        blank=True,
        help_text="Additional notes for the order",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["order_number"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"Order {self.order_number} - {self.user.username} ({self.status})"

    def save(self, *args, **kwargs) -> None:
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    @classmethod
    def generate_order_number(cls) -> str:
        """Generate unique order number."""
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"

    @classmethod
    def create_from_cart(cls, cart, payment) -> "Order":
        """Create order from cart and payment."""
        cart_items = list(cart.items.all())
        
        with transaction.atomic():
            order = cls.objects.create(
                user=cart.user,
                subtotal=cart.subtotal,
                shipping_cost=cart.shipping_cost,
                total=cart.total,
                payment=payment,
                shipping_address=cart.shipping_address,
                shipping_method=cart.shipping_method,
                applied_coupon=cart.applied_coupon,
                coupon_discount=cart.coupon_discount,
                status=cls.OrderStatus.CONFIRMED,
            )

            created_items = []
            for cart_item in cart_items:
                order_item = OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.unit_price,
                    total_price=cart_item.total_price,
                )
                created_items.append(order_item)
                
                if cart_item.product.stock_quantity < cart_item.quantity:
                    raise ValueError(f"Insufficient stock for product {cart_item.product.name}. Available: {cart_item.product.stock_quantity}, Requested: {cart_item.quantity}")
                
                cart_item.product.stock_quantity -= cart_item.quantity
                cart_item.product.save(update_fields=['stock_quantity'])

            transaction.on_commit(lambda: cls._create_invoice_after_commit(order))

            if cart.applied_coupon:
                from apps.checkout.models.coupon import CouponRedemption

                CouponRedemption.objects.create(
                    user=cart.user,
                    coupon=cart.applied_coupon,
                    order=order,
                    discount_amount=cart.coupon_discount,
                    original_total=cart.total_before_coupon,
                    final_total=cart.total,
                )

        return order

    @classmethod
    def _create_invoice_after_commit(cls, order):
        """Create invoice after transaction commits to ensure OrderItems are available."""
        from apps.checkout.services.invoice_creation_service import (
            InvoiceCreationService,
        )

        InvoiceCreationService.create_invoice_for_order(order)
