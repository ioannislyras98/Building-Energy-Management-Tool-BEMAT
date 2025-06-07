from django.contrib import admin
from .models import CoolingSystem

# Register your models here.
@admin.register(CoolingSystem)
class CoolingSystemAdmin(admin.ModelAdmin):
    list_display = [
        'uuid',
        'building',
        'project', 
        'user',
        'cooling_system_type',
        'cooling_unit_accessibility',
        'heat_pump_type',
        'power_kw',
        'construction_year',
        'energy_efficiency_ratio',
        'created_at'
    ]
    list_filter = [
        'cooling_system_type',
        'cooling_unit_accessibility',
        'construction_year',
        'created_at'
    ]
    search_fields = [
        'building__name',
        'project__name',
        'heat_pump_type',
        'cooling_system_type'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Στοιχεία Συστήματος Ψύξης', {
            'fields': (
                'cooling_system_type',
                'cooling_unit_accessibility', 
                'heat_pump_type',
                'power_kw',
                'construction_year',
                'energy_efficiency_ratio'
            )
        }),
        ('Λειτουργία & Συντήρηση', {
            'fields': ('maintenance_period', 'operating_hours')
        }),
        ('Χρονικές Πληροφορίες', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
