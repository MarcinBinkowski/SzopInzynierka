from django.contrib import admin
from apps.checkout.models.coupon import Coupon, CouponRedemption


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'discount_amount', 'valid_from', 'valid_until', 'max_uses', 'max_uses_per_user']
    list_filter = ['valid_from', 'valid_until']
    search_fields = ['code', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description')
        }),
        ('Discount', {
            'fields': ('discount_amount',)
        }),
        ('Usage Limits', {
            'fields': ('max_uses', 'max_uses_per_user')
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CouponRedemption)
class CouponRedemptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'coupon', 'order', 'discount_amount', 'created_at']
    list_filter = ['created_at', 'coupon']
    search_fields = ['user__username', 'coupon__code', 'order__order_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Redemption Details', {
            'fields': ('user', 'coupon', 'order')
        }),
        ('Discount Information', {
            'fields': ('discount_amount', 'original_total', 'final_total')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 