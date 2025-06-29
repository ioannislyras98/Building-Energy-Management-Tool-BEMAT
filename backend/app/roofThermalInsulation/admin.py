from django.contrib import admin
from .models import RoofThermalInsulation, RoofThermalInsulationMaterialLayer


class RoofThermalInsulationMaterialLayerInline(admin.TabularInline):
    model = RoofThermalInsulationMaterialLayer
    extra = 1
    readonly_fields = ['uuid', 'material_name', 'material_thermal_conductivity', 'surface_type_display', 'thermal_resistance']


@admin.register(RoofThermalInsulation)
class RoofThermalInsulationAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'building', 'u_coefficient', 'total_cost', 'annual_benefit', 'created_at', 'created_by']
    list_filter = ['created_at', 'building__project', 'created_by']
    search_fields = ['building__name', 'building__project__name', 'created_by__username']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    inlines = [RoofThermalInsulationMaterialLayerInline]
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'created_by', 'created_at', 'updated_at')
        }),
        ('Θερμικοί Υπολογισμοί', {
            'fields': ('u_coefficient', 'winter_hourly_losses', 'summer_hourly_losses', 
                      'heating_hours_per_year', 'cooling_hours_per_year')
        }),
        ('Οικονομική Ανάλυση', {
            'fields': ('total_cost', 'annual_benefit', 'time_period_years', 
                      'annual_operating_costs', 'discount_rate', 'net_present_value')
        }),
    )


@admin.register(RoofThermalInsulationMaterialLayer)
class RoofThermalInsulationMaterialLayerAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'roof_thermal_insulation', 'material_name', 'material_type', 'thickness', 'surface_area', 'cost']
    list_filter = ['material_type', 'surface_type', 'created_at']
    search_fields = ['material_name', 'roof_thermal_insulation__building__name']
    readonly_fields = ['uuid', 'material_name', 'material_thermal_conductivity', 'surface_type_display', 'thermal_resistance', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'roof_thermal_insulation', 'material', 'material_type', 'created_at', 'updated_at')
        }),
        ('Στοιχεία Υλικού', {
            'fields': ('material_name', 'material_thermal_conductivity', 'thickness', 'surface_area', 'thermal_resistance')
        }),
        ('Επιφάνεια', {
            'fields': ('surface_type', 'surface_type_display')
        }),
        ('Κόστος', {
            'fields': ('cost',)
        }),
        ('Σειρά', {
            'fields': ('order',)
        }),
    )
