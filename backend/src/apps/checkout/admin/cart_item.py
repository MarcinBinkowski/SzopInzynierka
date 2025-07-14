from django.contrib import admin
from django.db import models
from django.forms import TextInput, Textarea
from django.utils.html import format_html

from apps.checkout.models import CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin configuration for CartItem model."""

    list_display = [
        "id",
        "cart_display",
        "product_display",
        "quantity",
        "unit_price_display",
        "total_price_display",
        "availability_status",
        "created_at",
    ]
    list_filter = [
        "created_at",
        "cart__status",
        "product__category",
    ]
    search_fields = [
        "cart__user__username",
        "product__name",
        "product__sku",
    ]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "total_price_display",
        "availability_status",
    ]

    fieldsets = (
        (
            "Item Information",
            {"fields": ("cart", "product", "quantity", "unit_price",)},
        ),
        (
            "Calculated Fields",
            {
                "fields": ("total_price_display", "availability_status"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("id", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    formfield_overrides = {
        models.CharField: {"widget": TextInput(attrs={"size": "50"})},
        models.TextField: {"widget": Textarea(attrs={"rows": 3, "cols": 80})},
    }

    def cart_display(self, obj: CartItem) -> str:
        """Display cart information."""
        return format_html(
            '<a href="/admin/checkout/cart/{}/">Cart {}</a>',
            obj.cart.id,
            obj.cart.id,
        )

    cart_display.short_description = "Cart"

    def product_display(self, obj: CartItem) -> str:
        """Display product information."""
        return format_html(
            '<a href="/admin/catalog/product/{}/">{}</a>',
            obj.product.id,
            obj.product.name,
        )

    product_display.short_description = "Product"

    def unit_price_display(self, obj: CartItem) -> str:
        """Display unit price with formatting."""
        return format_html("${:.2f}", obj.unit_price)

    unit_price_display.short_description = "Unit Price"

    def total_price_display(self, obj: CartItem) -> str:
        """Display total price with formatting."""
        return format_html("${:.2f}", obj.total_price)

    total_price_display.short_description = "Total Price"

    def availability_status(self, obj: CartItem) -> str:
        """Display availability status with color coding."""
        if not obj.is_available:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Unavailable</span>'
            )
        elif not obj.stock_available:
            return format_html(
                '<span style="color: orange; font-weight: bold;">⚠ Low Stock</span>'
            )
        else:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Available</span>'
            )

    availability_status.short_description = "Status"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        return queryset.select_related("cart", "product")
