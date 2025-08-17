from django.contrib import admin
from apps.checkout.models import InvoiceTemplate

@admin.register(InvoiceTemplate)
class InvoiceTemplateAdmin(admin.ModelAdmin):
    """Admin interface for invoice templates."""
    
    list_display = ['name', 'is_default', 'created_by', 'created_at']
    list_filter = ['is_default', 'created_at', 'updated_at']
    search_fields = ['name', 'content']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'content', 'is_default')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Set the current user as creator if this is a new template."""
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change) 