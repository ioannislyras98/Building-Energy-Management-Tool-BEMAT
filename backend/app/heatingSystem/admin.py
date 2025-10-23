from django.contrib import admin
from .models import HeatingSystem

@admin.register(HeatingSystem)
class HeatingSystemAdmin(admin.ModelAdmin):
    list_display = [
        'uuid',
        'building',
        'project', 
        'user',
        'heating_system_type',
        'exchanger_type',
        'power_kw',
        'construction_year',
        'cop',
        'created_at'
    ]
    list_filter = [
        'heating_system_type',
        'exchanger_type',
        'construction_year',
        'created_at'
    ]
    search_fields = [
        'building__name',
        'project__name',
        'heating_system_type',
        'exchanger_type'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Στοιχεία Συστήματος Θέρμανσης', {
            'fields': (
                'heating_system_type',
                'exchanger_type',
                'central_boiler_system',
                'central_heat_pump_system',
                'local_heating_system',
                'power_kw',
                'construction_year',
                'cop',
                'distribution_network_state'
            )
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
