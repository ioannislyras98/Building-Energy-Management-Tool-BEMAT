from django.contrib import admin
from .models import OldAirConditioning, NewAirConditioning, AirConditioningAnalysis


@admin.register(OldAirConditioning)
class OldAirConditioningAdmin(admin.ModelAdmin):
    list_display = ('btu_type', 'building', 'quantity', 'total_consumption_kwh', 'created_at')
    list_filter = ('building', 'created_at', 'btu_type')
    search_fields = ('building__name', 'btu_type')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                       'total_consumption_kwh', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('building', 'project')
        }),
        ('Τεχνικά Χαρακτηριστικά', {
            'fields': ('btu_type', 'cop_percentage', 'eer_percentage', 'quantity')
        }),
        ('Λειτουργία', {
            'fields': ('heating_hours_per_year', 'cooling_hours_per_year')
        }),
        ('Υπολογιζόμενα Στοιχεία', {
            'fields': ('heating_consumption_kwh', 'cooling_consumption_kwh', 'total_consumption_kwh'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NewAirConditioning)
class NewAirConditioningAdmin(admin.ModelAdmin):
    list_display = ('btu_type', 'building', 'quantity', 'total_consumption_kwh', 'total_cost', 'created_at')
    list_filter = ('building', 'created_at', 'btu_type')
    search_fields = ('building__name', 'btu_type')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                       'total_consumption_kwh', 'total_cost', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('building', 'project')
        }),
        ('Τεχνικά Χαρακτηριστικά', {
            'fields': ('btu_type', 'cop_percentage', 'eer_percentage', 'quantity')
        }),
        ('Λειτουργία', {
            'fields': ('heating_hours_per_year', 'cooling_hours_per_year')
        }),
        ('Οικονομικά Στοιχεία', {
            'fields': ('cost_per_unit', 'installation_cost')
        }),
        ('Υπολογιζόμενα Στοιχεία', {
            'fields': ('heating_consumption_kwh', 'cooling_consumption_kwh', 'total_consumption_kwh', 'total_cost'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AirConditioningAnalysis)
class AirConditioningAnalysisAdmin(admin.ModelAdmin):
    list_display = ('building', 'energy_savings_kwh', 'annual_energy_savings', 'payback_period', 'created_at')
    list_filter = ('building', 'created_at')
    search_fields = ('building__name',)
    ordering = ('-created_at',)
    readonly_fields = ('id', 'energy_cost_kwh', 'total_old_consumption', 'total_new_consumption', 'energy_savings_kwh',
                       'total_investment_cost', 'annual_energy_savings', 'annual_economic_benefit', 'payback_period',
                       'net_present_value', 'internal_rate_of_return', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('building', 'project')
        }),
        ('Παράμετροι Αξιολόγησης', {
            'fields': ('lifespan_years', 'discount_rate')
        }),
        ('Αποτελέσματα Ανάλυσης', {
            'fields': ('energy_cost_kwh', 'total_old_consumption', 'total_new_consumption', 'energy_savings_kwh',
                      'total_investment_cost', 'annual_energy_savings', 'annual_economic_benefit', 'payback_period',
                      'net_present_value', 'internal_rate_of_return'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
