from django.contrib import admin
from .models import PhotovoltaicSystem

@admin.register(PhotovoltaicSystem)
class PhotovoltaicSystemAdmin(admin.ModelAdmin):
    list_display = [
        'uuid', 
        'user', 
        'building', 
        'project', 
        'pv_system_type',
        'total_cost',
        'power_per_panel',
        'created_at'
    ]
    list_filter = [
        'pv_system_type',
        'pv_usage',
        'created_at',
        'updated_at'
    ]
    search_fields = [
        'building__name',
        'project__name',
        'user__username',
        'pv_system_type',
        'pv_usage'
    ]
    readonly_fields = [
        'uuid',
        'created_at',
        'updated_at',
        'estimated_cost',
        'unexpected_expenses',
        'value_after_unexpected',
        'tax_burden',
        'total_cost',
        'pv_panels_cost',
        'metal_bases_cost',
        'piping_cost',
        'wiring_cost',
        'inverter_cost',
        'installation_cost',
    ]
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'user', 'building', 'project', 'created_at', 'updated_at')
        }),
        ('Φωτοβολταϊκά Πλαίσια', {
            'fields': ('pv_panels_quantity', 'pv_panels_unit_price', 'pv_panels_cost'),
            'classes': ('collapse',)
        }),
        ('Μεταλλικές Βάσεις Στήριξης', {
            'fields': ('metal_bases_quantity', 'metal_bases_unit_price', 'metal_bases_cost'),
            'classes': ('collapse',)
        }),
        ('Σωληνώσεις', {
            'fields': ('piping_quantity', 'piping_unit_price', 'piping_cost'),
            'classes': ('collapse',)
        }),
        ('Καλωδιώσεις', {
            'fields': ('wiring_quantity', 'wiring_unit_price', 'wiring_cost'),
            'classes': ('collapse',)
        }),
        ('Μετατροπέας Ισχύος', {
            'fields': ('inverter_quantity', 'inverter_unit_price', 'inverter_cost'),
            'classes': ('collapse',)
        }),
        ('Εγκατάσταση', {
            'fields': ('installation_quantity', 'installation_unit_price', 'installation_cost'),
            'classes': ('collapse',)
        }),
        ('Οικονομικοί Δείκτες', {
            'fields': ('estimated_cost', 'unexpected_expenses', 'value_after_unexpected', 'tax_burden', 'total_cost'),
            'classes': ('collapse',)
        }),
        ('Ενεργειακοί Δείκτες', {
            'fields': ('power_per_panel', 'collector_efficiency', 'installation_angle', 'pv_usage', 'pv_system_type'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'building', 'project')
