from django.contrib import admin
from apps.profile.models import RoleAssignment


@admin.register(RoleAssignment)
class RoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'assigned_by', 'is_active', 'created_at']
    list_display_links = ['user', 'role']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__email', 'assigned_by__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Role Assignment', {
            'fields': ('user', 'role', 'assigned_by', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Automatically set assigned_by to current user if not set."""
        if not change:  # Only for new assignments
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change) 