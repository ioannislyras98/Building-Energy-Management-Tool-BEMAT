from django.contrib import admin
from .models import WindowReplacement


@admin.register(WindowReplacement)
class WindowReplacementAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'building', 'old_thermal_conductivity', 'new_thermal_conductivity', 'window_area', 'created_at')
    list_filter = ('created_at', 'building')
    search_fields = ('uuid', 'building__name')
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('uuid', 'building', 'project')
        }),
        ('Window Data', {
            'fields': ('old_thermal_conductivity', 'new_thermal_conductivity', 'window_area')
        }),
        ('Calculated Losses', {
            'fields': ('old_losses_summer', 'old_losses_winter', 'new_losses_summer', 'new_losses_winter')
        }),
        ('Economic Data', {
            'fields': ('cost_per_sqm', 'energy_cost_kwh', 'maintenance_cost_annual', 'lifespan_years')
        }),
        ('Results', {
            'fields': ('energy_savings_summer', 'energy_savings_winter', 'total_energy_savings', 
                      'annual_cost_savings', 'total_investment_cost', 'payback_period',
                      'net_present_value', 'internal_rate_of_return')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
