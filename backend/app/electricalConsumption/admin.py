from django.contrib import admin
from .models import ElectricalConsumption


@admin.register(ElectricalConsumption)
class ElectricalConsumptionAdmin(admin.ModelAdmin):
    list_display = [
        'uuid', 
        'consumption_type', 
        'thermal_zone',
        'building', 
        'project', 
        'user', 
        'load_power',
        'quantity',
        'operating_hours_per_year',
        'annual_energy_consumption',
        'created_at'
    ]
    list_filter = [
        'consumption_type', 
        'load_type',
        'thermal_zone',
        'created_at', 
        'updated_at'
    ]
    search_fields = [
        'consumption_type', 
        'period',
        'building__name', 
        'project__name', 
        'user__username',
        'thermal_zone__thermal_zone_usage'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'annual_energy_consumption']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Πληροφορίες Ηλεκτρικής Κατανάλωσης', {
            'fields': (
                'consumption_type',
                'thermal_zone',
                'period',
                'energy_consumption',
                'load_type',
                'load_power',
                'quantity',
                'operating_hours_per_year'
            )
        }),
        ('Υπολογισμοί', {
            'fields': ('annual_energy_consumption',),
            'classes': ('collapse',)
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
