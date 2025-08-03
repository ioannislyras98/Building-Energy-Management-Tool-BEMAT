from django.contrib import admin
from .models import AutomaticLightingControl


@admin.register(AutomaticLightingControl)
class AutomaticLightingControlAdmin(admin.ModelAdmin):
    list_display = [
        'building', 
        'project',
        'lighting_area',
        'cost_per_m2',
        'total_investment_cost',
        'payback_period',
        'created_at'
    ]
    list_filter = [
        'project',
        'created_at',
        'updated_at'
    ]
    search_fields = [
        'building__name',
        'project__name'
    ]
    readonly_fields = [
        'total_investment_cost',
        'annual_energy_savings',
        'annual_economic_benefit',
        'payback_period',
        'net_present_value',
        'internal_rate_of_return',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('building', 'project')
        }),
        ('Στοιχεία Συστήματος Φωτισμού', {
            'fields': (
                'lighting_area',
                'cost_per_m2',
                'installation_cost',
                'maintenance_cost'
            )
        }),
        ('Ενεργειακά Στοιχεία', {
            'fields': (
                'lighting_energy_savings',
                'energy_cost_kwh'
            )
        }),
        ('Παράμετροι Αξιολόγησης', {
            'fields': (
                'time_period',
                'discount_rate'
            )
        }),
        ('Οικονομική Ανάλυση (Αυτόματος Υπολογισμός)', {
            'fields': (
                'total_investment_cost',
                'annual_energy_savings',
                'annual_economic_benefit',
                'payback_period',
                'net_present_value',
                'internal_rate_of_return'
            ),
            'classes': ('collapse',)
        }),
        ('Χρονικά Στοιχεία', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
