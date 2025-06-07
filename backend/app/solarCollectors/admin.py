from django.contrib import admin
from .models import SolarCollector

# Register your models here.
@admin.register(SolarCollector)
class SolarCollectorAdmin(admin.ModelAdmin):
    list_display = [
        'uuid',
        'building',
        'project', 
        'user',
        'solar_collector_usage',
        'solar_collector_type',
        'collector_surface_area',
        'hot_water_storage_capacity',
        'heating_storage_capacity',
        'created_at'
    ]
    list_filter = [
        'solar_collector_usage',
        'solar_collector_type',
        'created_at'
    ]
    search_fields = [
        'building__name',
        'project__name',
        'solar_collector_usage',
        'solar_collector_type'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Στοιχεία Ηλιακών Συλλεκτών', {
            'fields': (
                'solar_collector_usage',
                'solar_collector_type',
                'collector_surface_area',
                'hot_water_storage_capacity',
                'heating_storage_capacity',
                'distribution_network_state',
                'terminal_units_position',
                'collector_accessibility',
                'storage_tank_condition'
            )
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
