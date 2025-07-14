from decimal import Decimal
from typing import Any

from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.http import HttpRequest
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from apps.catalog.models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "sku",
        "category",
        "price_display",
        "stock_display",
        "status",
        "is_visible",
        "sale_status_display",
        "created_at",
    ]

    list_filter = [
        "status",
        "is_visible",
        "category",
        "tags",
        "created_at",
    ]

    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ("name",)}

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("name", "slug", "sku", "description", "short_description")},
        ),
        ("Pricing", {"fields": ("price", "original_price", "sale_start", "sale_end")}),
        ("Inventory", {"fields": ("stock_quantity",)}),
        ("Organization", {"fields": ("category", "tags")}),
        ("Visibility", {"fields": ("status", "is_visible")}),
    )

    filter_horizontal = ["tags"]

    def price_display(self, obj: Product) -> str:
        """Display current price with sale indication."""
        if not obj.price:
            return "No price set"

        current_price = float(obj.current_price)

        if obj.is_on_sale and obj.original_price:
            original_price = float(obj.original_price)
            return format_html(
                '<span style="color: red; font-weight: bold;">${}</span> '
                '<span style="text-decoration: line-through; color: gray;">(was ${})</span>',
                f"{current_price:.2f}",
                f"{original_price:.2f}",
            )

        return format_html("<span>${}</span>", f"{current_price:.2f}")

    price_display.short_description = "Price"

    def stock_display(self, obj: Product) -> str:
        """Display stock status with color coding."""
        if obj.stock_quantity > 10:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ {} in stock</span>',
                obj.stock_quantity,
            )
        elif obj.stock_quantity > 0:
            return format_html(
                '<span style="color: orange; font-weight: bold;">⚠ {} left</span>',
                obj.stock_quantity,
            )

        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Out of stock</span>'
        )

    stock_display.short_description = "Stock"

    def sale_status_display(self, obj: Product) -> str:
        """Display sale status with timing info."""
        if not obj.is_on_sale:
            return "Regular price"

        if obj.sale_start and obj.sale_end:
            return format_html(
                '<span style="color: orange;">🏷️ On Sale</span><br>'
                "<small>{} - {}</small>",
                obj.sale_start.strftime("%m/%d/%Y"),
                obj.sale_end.strftime("%m/%d/%Y"),
            )

        return format_html('<span style="color: orange;">🏷️ On Sale</span>')

    sale_status_display.short_description = "Sale Status"

    def get_queryset(self, request: HttpRequest):
        """Optimize queryset for list display."""
        return (
            super()
            .get_queryset(request)
            .select_related("category")
            .prefetch_related("tags")
        )
