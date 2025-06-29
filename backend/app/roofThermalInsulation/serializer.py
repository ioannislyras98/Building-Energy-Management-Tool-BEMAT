from rest_framework import serializers
from .models import RoofThermalInsulation, RoofThermalInsulationMaterialLayer
from materials.serializers import MaterialListSerializer


class RoofThermalInsulationMaterialLayerSerializer(serializers.ModelSerializer):
    material_info = MaterialListSerializer(source='material', read_only=True)
    thermal_resistance = serializers.ReadOnlyField()
    
    class Meta:
        model = RoofThermalInsulationMaterialLayer
        fields = [
            'uuid', 'material', 'material_info', 'material_type', 'surface_type',
            'thickness', 'surface_area', 'cost', 'material_name', 
            'material_thermal_conductivity', 'surface_type_display', 'thermal_resistance',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at', 'material_name', 
                          'material_thermal_conductivity', 'surface_type_display']


class RoofThermalInsulationSerializer(serializers.ModelSerializer):
    old_materials = serializers.SerializerMethodField()
    new_materials = serializers.SerializerMethodField()
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = RoofThermalInsulation
        fields = [
            'uuid', 'building', 'project', 'building_name', 'project_name',
            'u_coefficient', 'winter_hourly_losses', 'summer_hourly_losses',
            'heating_hours_per_year', 'cooling_hours_per_year', 'total_cost',
            'annual_benefit', 'time_period_years', 'annual_operating_costs',
            'discount_rate', 'net_present_value', 'old_materials', 'new_materials',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']

    def get_old_materials(self, obj):
        old_materials = obj.material_layers.filter(material_type='old')
        return RoofThermalInsulationMaterialLayerSerializer(old_materials, many=True).data

    def get_new_materials(self, obj):
        new_materials = obj.material_layers.filter(material_type='new')
        return RoofThermalInsulationMaterialLayerSerializer(new_materials, many=True).data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RoofThermalInsulationListSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    old_materials_count = serializers.SerializerMethodField()
    new_materials_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RoofThermalInsulation
        fields = [
            'uuid', 'building_name', 'project_name', 'u_coefficient',
            'total_cost', 'annual_benefit', 'net_present_value',
            'old_materials_count', 'new_materials_count', 'created_at'
        ]

    def get_old_materials_count(self, obj):
        return obj.material_layers.filter(material_type='old').count()

    def get_new_materials_count(self, obj):
        return obj.material_layers.filter(material_type='new').count()
