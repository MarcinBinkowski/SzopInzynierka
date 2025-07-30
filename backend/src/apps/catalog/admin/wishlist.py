from django.contrib import admin
from django.utils.html import format_html
from apps.catalog.models import WishlistItem


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    """Admin configuration for WishlistItem model."""

    list_display = [
        "id",
        "user_display",
        "product_display",
        "product_status",
        "product_stock",
        "product_price",
        "created_at",
    ]
    list_filter = [
        "created_at",
        "product__status",
        "product__category",
    ]
    search_fields = [
        "user__email",
        "user__username",
        "product__name",
        "product__sku",
    ]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "product_status",
        "product_stock",
        "product_price",
    ]
    ordering = ["-created_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("user", "product")}),
        (
            "Product Information",
            {
                "fields": ("product_status", "product_stock", "product_price"),
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

    def user_display(self, obj: WishlistItem) -> str:
        """Display user information."""
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.user.email,
            obj.user.username,
        )

    user_display.short_description = "User"

    def product_display(self, obj: WishlistItem) -> str:
        """Display product information."""
        return format_html(
            '<strong>{}</strong><br><small>SKU: {}</small>',
            obj.product.name,
            obj.product.sku,
        )

    product_display.short_description = "Product"

    def product_status(self, obj: WishlistItem) -> str:
        """Display product status with color coding."""
        status = obj.product.status
        if status == "active":
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ {}</span>',
                status.title(),
            )
        elif status == "draft":
            return format_html(
                '<span style="color: gray;">📝 {}</span>',
                status.title(),
            )
        else:
            return format_html(
                '<span style="color: red;">✗ {}</span>',
                status.title(),
            )

    product_status.short_description = "Status"

    def product_stock(self, obj: WishlistItem) -> str:
        """Display product stock status."""
        if obj.product.stock_quantity > 10:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ {} in stock</span>',
                obj.product.stock_quantity,
            )
        elif obj.product.stock_quantity > 0:
            return format_html(
                '<span style="color: orange; font-weight: bold;">⚠ {} left</span>',
                obj.product.stock_quantity,
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Out of stock</span>'
            )

    product_stock.short_description = "Stock"

    def product_price(self, obj: WishlistItem) -> str:
        """Display product price with sale indication."""
        if obj.product.is_on_sale:
            return format_html(
                '<span style="color: red; font-weight: bold;">${}</span> '
                '<span style="text-decoration: line-through; color: gray;">(was ${})</span>',
                f"{obj.product.current_price:.2f}",
                f"{obj.product.original_price:.2f}",
            )
        return format_html("<span>${}</span>", f"{obj.product.price:.2f}")

    product_price.short_description = "Price"

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return (
            super()
            .get_queryset(request)
            .select_related("user", "product", "product__category")
        ) 