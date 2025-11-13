from django.contrib import admin
from .models import BoilerReplacement


@admin.register(BoilerReplacement)
class BoilerReplacementAdmin(admin.ModelAdmin):
    list_display = [
        'building', 
        'project',
        'old_boiler_efficiency',
        'new_boiler_efficiency',
        'annual_heating_consumption_liters',
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
        'heating_oil_savings_liters',
        'oil_price_per_liter',
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
        ('Συντελεστές Απόδοσης', {
            'fields': (
                'old_boiler_efficiency',
                'new_boiler_efficiency'
            )
        }),
        ('Κόστη Λέβητα', {
            'fields': (
                'boiler_cost',
                'installation_cost',
                'maintenance_cost'
            )
        }),
        ('Ενεργειακά Στοιχεία', {
            'fields': (
                'annual_heating_consumption_liters',
                'heating_oil_savings_liters',
                'oil_price_per_liter'
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
