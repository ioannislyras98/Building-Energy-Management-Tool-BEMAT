from django.contrib import admin
from .models import ThermalZone


@admin.register(ThermalZone)
class ThermalZoneAdmin(admin.ModelAdmin):
    list_display = [
        'uuid', 
        'thermal_zone_usage', 
        'building', 
        'project', 
        'user', 
        'floor',
        'total_thermal_zone_area',
        'created_at'
    ]
    list_filter = [
        'thermal_zone_usage', 
        'space_condition',
        'floor',
        'created_at', 
        'updated_at'
    ]
    search_fields = [
        'thermal_zone_usage', 
        'description',
        'building__name', 
        'project__name', 
        'user__username'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Πληροφορίες Θερμικής Ζώνης', {
            'fields': (
                'thermal_zone_usage',
                'description',
                'space_condition',
                'floor',
                'total_thermal_zone_area'
            )
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
