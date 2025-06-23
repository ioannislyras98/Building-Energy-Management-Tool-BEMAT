from rest_framework import serializers
from .models import (
    ExternalWallThermalInsulation, 
    ThermalInsulationMaterialLayer
)
from materials.serializers import MaterialListSerializer
from django.contrib.auth.models import User


class ThermalInsulationMaterialLayerSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_thermal_conductivity = serializers.FloatField(
        source='material.thermal_conductivity', 
        read_only=True
    )
    material_category = serializers.CharField(source='material.category', read_only=True)
    thermal_resistance = serializers.ReadOnlyField()
    surface_type_display = serializers.CharField(source='get_surface_type_display', read_only=True)
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    
    class Meta:
        model = ThermalInsulationMaterialLayer
        fields = [
            'uuid', 'material', 'material_name', 'material_thermal_conductivity',
            'material_category', 'material_type', 'material_type_display',
            'surface_type', 'surface_type_display', 'thickness', 'surface_area', 
            'cost', 'thermal_resistance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at', 'thermal_resistance']


class ExternalWallThermalInsulationSerializer(serializers.ModelSerializer):
    material_layers = ThermalInsulationMaterialLayerSerializer(many=True, read_only=True)
    old_materials = serializers.SerializerMethodField()
    new_materials = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.username', read_only=True)
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    total_materials_cost = serializers.SerializerMethodField()
    total_surface_area = serializers.SerializerMethodField()
    
    class Meta:
        model = ExternalWallThermalInsulation
        fields = [
            'uuid', 'user', 'user_name', 'building', 'building_name', 
            'project', 'project_name', 'u_coefficient', 'winter_hourly_losses',
            'summer_hourly_losses', 'heating_hours_per_year', 'cooling_hours_per_year',
            'total_cost', 'annual_benefit', 'time_period_years', 'annual_operating_costs',
            'discount_rate', 'net_present_value', 'material_layers', 'old_materials',
            'new_materials', 'total_materials_cost', 'total_surface_area',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'created_at', 'updated_at', 'u_coefficient', 
            'net_present_value', 'total_materials_cost', 'total_surface_area'
        ]

    def get_old_materials(self, obj):
        old_materials = obj.material_layers.filter(material_type='old')
        return ThermalInsulationMaterialLayerSerializer(old_materials, many=True).data

    def get_new_materials(self, obj):
        new_materials = obj.material_layers.filter(material_type='new')
        return ThermalInsulationMaterialLayerSerializer(new_materials, many=True).data

    def get_total_materials_cost(self, obj):
        return sum(material.cost for material in obj.material_layers.all())

    def get_total_surface_area(self, obj):
        return sum(material.surface_area for material in obj.material_layers.all())

    def create(self, validated_data):
        # Set user to current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExternalWallThermalInsulationCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating thermal insulation without materials"""
    
    class Meta:
        model = ExternalWallThermalInsulation
        fields = [
            'building', 'project', 'winter_hourly_losses', 'summer_hourly_losses',
            'heating_hours_per_year', 'cooling_hours_per_year', 'total_cost',
            'annual_benefit', 'time_period_years', 'annual_operating_costs',
            'discount_rate'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)