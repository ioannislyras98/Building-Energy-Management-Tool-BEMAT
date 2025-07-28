from django.contrib import admin
from .models import HotWaterUpgrade


@admin.register(HotWaterUpgrade)
class HotWaterUpgradeAdmin(admin.ModelAdmin):
    list_display = [
        'building',
        'project',
        'total_investment_cost',
        'annual_economic_benefit',
        'payback_period',
        'created_at'
    ]
    list_filter = ['created_at', 'building']
    search_fields = ['building', 'project']
    readonly_fields = [
        'solar_collectors_subtotal',
        'metal_support_bases_subtotal',
        'solar_system_subtotal',
        'insulated_pipes_subtotal',
        'central_heater_installation_subtotal',
        'total_investment_cost',
        'annual_energy_consumption_kwh',
        'annual_solar_savings_kwh',
        'annual_economic_benefit',
        'payback_period',
        'net_present_value',
        'internal_rate_of_return',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('building', 'project')
        }),
        ('System Components', {
            'fields': (
                ('solar_collectors_quantity', 'solar_collectors_unit_price', 'solar_collectors_subtotal'),
                ('metal_support_bases_quantity', 'metal_support_bases_unit_price', 'metal_support_bases_subtotal'),
                ('solar_system_quantity', 'solar_system_unit_price', 'solar_system_subtotal'),
                ('insulated_pipes_quantity', 'insulated_pipes_unit_price', 'insulated_pipes_subtotal'),
                ('central_heater_installation_quantity', 'central_heater_installation_unit_price', 'central_heater_installation_subtotal'),
            )
        }),
        ('Economic Data', {
            'fields': (
                'electric_heater_power',
                'operating_hours_per_year',
                'solar_utilization_percentage',
                'energy_cost_kwh',
                'lifespan_years'
            )
        }),
        ('Calculated Results', {
            'fields': (
                'total_investment_cost',
                'annual_energy_consumption_kwh',
                'annual_solar_savings_kwh',
                'annual_economic_benefit',
                'payback_period',
                'net_present_value',
                'internal_rate_of_return'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        })
    )
