from django.contrib import admin
from .models import NaturalGasNetwork


@admin.register(NaturalGasNetwork)
class NaturalGasNetworkAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'building',
        'project',
        'total_investment_cost',
        'annual_economic_benefit',
        'payback_period',
        'created_at'
    ]
    list_filter = [
        'created_at',
        'lifespan_years',
        'building__name'
    ]
    search_fields = [
        'building__name',
        'project__name'
    ]
    readonly_fields = [
        'burner_replacement_subtotal',
        'gas_pipes_subtotal',
        'gas_detection_systems_subtotal',
        'boiler_cleaning_subtotal',
        'total_investment_cost',
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
                ('burner_replacement_quantity', 'burner_replacement_unit_price', 'burner_replacement_subtotal'),
                ('gas_pipes_quantity', 'gas_pipes_unit_price', 'gas_pipes_subtotal'),
                ('gas_detection_systems_quantity', 'gas_detection_systems_unit_price', 'gas_detection_systems_subtotal'),
                ('boiler_cleaning_quantity', 'boiler_cleaning_unit_price', 'boiler_cleaning_subtotal'),
            )
        }),
        ('Economic Data', {
            'fields': (
                'current_energy_cost_per_year',
                'natural_gas_cost_per_year',
                'annual_energy_savings',
                'lifespan_years'
            )
        }),
        ('Calculated Results', {
            'fields': (
                'total_investment_cost',
                'annual_economic_benefit',
                'payback_period',
                'net_present_value',
                'internal_rate_of_return'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('building', 'project')
