from django.contrib import admin
from .models import (
    ExternalWallThermalInsulation, 
    ThermalInsulationMaterialLayer
)


class ThermalInsulationMaterialLayerInline(admin.TabularInline):
    model = ThermalInsulationMaterialLayer
    extra = 1
    readonly_fields = ['uuid', 'thermal_resistance', 'created_at', 'updated_at']


@admin.register(ExternalWallThermalInsulation)
class ExternalWallThermalInsulationAdmin(admin.ModelAdmin):
    list_display = [
        'building', 'project', 'user', 'u_coefficient', 
        'winter_hourly_losses', 'summer_hourly_losses', 'created_at'
    ]
    list_filter = ['user', 'building', 'project', 'created_at']
    search_fields = ['building__name', 'project__name', 'user__username']
    readonly_fields = [
        'uuid', 'u_coefficient', 'created_at', 'updated_at'
    ]
    inlines = [ThermalInsulationMaterialLayerInline]
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(ThermalInsulationMaterialLayer)
class ThermalInsulationMaterialLayerAdmin(admin.ModelAdmin):
    list_display = [
        'thermal_insulation', 'material', 'surface_type', 
        'thickness', 'surface_area', 'cost', 'thermal_resistance'
    ]
    list_filter = [
        'surface_type', 'material', 'thermal_insulation__building'
    ]
    search_fields = [
        'material__name', 'thermal_insulation__building__name'
    ]
    readonly_fields = [
        'uuid', 'thermal_resistance', 'created_at', 'updated_at'
    ]
