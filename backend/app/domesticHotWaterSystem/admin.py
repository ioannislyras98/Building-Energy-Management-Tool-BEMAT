from django.contrib import admin
from .models import DomesticHotWaterSystem

# Register your models here.
@admin.register(DomesticHotWaterSystem)
class DomesticHotWaterSystemAdmin(admin.ModelAdmin):
    list_display = [
        'uuid',
        'building',
        'project', 
        'user',
        'heating_system_type',
        'boiler_type',
        'power_kw',
        'thermal_efficiency',
        'created_at'
    ]
    list_filter = [
        'heating_system_type',
        'boiler_type',
        'created_at'
    ]
    search_fields = [
        'building__name',
        'project__name',
        'heating_system_type',
        'boiler_type'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Στοιχεία Συστήματος Ζεστού Νερού Χρήσης', {
            'fields': (
                'heating_system_type',
                'boiler_type',
                'power_kw',
                'thermal_efficiency',
                'distribution_network_state',
                'storage_tank_state',
                'energy_metering_system'
            )
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
