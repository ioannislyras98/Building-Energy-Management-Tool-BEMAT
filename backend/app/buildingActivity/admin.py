from django.contrib import admin
from .models import BuildingActivity


@admin.register(BuildingActivity)
class BuildingActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'building', 'action_type', 'user_display_name', 'created_at')
    list_filter = ('action_type', 'created_at', 'building', 'project')
    search_fields = ('title', 'description', 'building__name', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at', 'ip_address', 'user_agent', 'session_key')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('building', 'project', 'user', 'action_type', 'title', 'description')
        }),
        ('Related Object', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent', 'session_key', 'extra_data'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
