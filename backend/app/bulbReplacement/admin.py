from django.contrib import admin
from .models import BulbReplacement


@admin.register(BulbReplacement)
class BulbReplacementAdmin(admin.ModelAdmin):
    list_display = [
        'uuid', 'building', 'user', 'old_bulb_type', 'new_bulb_type',
        'energy_savings_kwh', 'annual_cost_savings', 'payback_period',
        'created_at'
    ]
    list_filter = [
        'old_bulb_type', 'new_bulb_type', 'created_at'
    ]
    search_fields = [
        'building__name', 'user__username', 'old_bulb_type', 'new_bulb_type'
    ]
    readonly_fields = [
        'uuid', 'old_consumption_kwh', 'new_consumption_kwh',
        'energy_savings_kwh', 'total_investment_cost',
        'annual_cost_savings', 'payback_period',
        'net_present_value', 'internal_rate_of_return',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('uuid', 'user', 'building', 'project')
        }),
        ('Παλαιό Σύστημα Φωτισμού', {
            'fields': (
                'old_bulb_type', 'old_power_per_bulb', 'old_bulb_count',
                'old_operating_hours', 'old_consumption_kwh'
            )
        }),
        ('Νέο Σύστημα Φωτισμού', {
            'fields': (
                'new_bulb_type', 'new_power_per_bulb', 'new_bulb_count',
                'new_operating_hours', 'new_consumption_kwh'
            )
        }),
        ('Οικονομικά Στοιχεία', {
            'fields': (
                'cost_per_new_bulb', 'installation_cost', 'energy_cost_kwh',
                'maintenance_cost_annual', 'lifespan_years'
            )
        }),
        ('Υπολογιζόμενα Αποτελέσματα', {
            'fields': (
                'energy_savings_kwh', 'total_investment_cost',
                'annual_cost_savings', 'payback_period',
                'net_present_value', 'internal_rate_of_return'
            )
        }),
        ('Χρονικά Στοιχεία', {
            'fields': ('created_at', 'updated_at')
        }),
    )
