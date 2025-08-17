from django.contrib import admin
from apps.checkout.models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin interface for invoices."""
    
    list_display = ['invoice_number', 'order', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['invoice_number', 'order__order_number']
    readonly_fields = ['created_at', 'updated_at', 'html_content']
    
    fieldsets = (
        ('Invoice Information', {
            'fields': ('invoice_number', 'order')
        }),
        ('Content', {
            'fields': ('html_content',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
