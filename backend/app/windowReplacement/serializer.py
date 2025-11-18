from rest_framework import serializers
from .models import WindowReplacement
from django.contrib.auth.models import User


class WindowReplacementSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    efficiency_improvement = serializers.SerializerMethodField()
    total_lifetime_savings = serializers.SerializerMethodField()
    
    class Meta:
        model = WindowReplacement
        fields = [
            'uuid', 'user', 'user_name', 'building', 'building_name', 
            'project', 'project_name', 'old_thermal_conductivity', 'new_thermal_conductivity',
            'window_area', 'old_losses_summer', 'old_losses_winter',
            'new_losses_summer', 'new_losses_winter', 'cost_per_sqm',
            'energy_cost_kwh', 'maintenance_cost_annual', 'lifespan_years',
            'discount_rate', 'energy_savings_summer', 'energy_savings_winter', 'total_energy_savings',
            'annual_cost_savings', 'total_investment_cost', 'payback_period',
            'net_present_value', 'internal_rate_of_return', 'efficiency_improvement',
            'total_lifetime_savings', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'user', 'created_at', 'updated_at', 'energy_savings_summer',
            'energy_savings_winter', 'total_energy_savings', 'annual_cost_savings',
            'total_investment_cost', 'payback_period', 'net_present_value',
            'internal_rate_of_return', 'efficiency_improvement', 'total_lifetime_savings'
        ]

    def get_efficiency_improvement(self, obj):
        return obj.get_efficiency_improvement()

    def get_total_lifetime_savings(self, obj):
        return obj.get_total_lifetime_savings()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        
        instance = WindowReplacement.objects.create(**validated_data)
        
        instance.calculate_energy_savings()
        instance.calculate_economic_benefits()
        instance.save()
        
        return instance

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.calculate_energy_savings()
        instance.calculate_economic_benefits()
        instance.save()
        
        return instance


class WindowReplacementListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for list views
    """
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    efficiency_improvement = serializers.SerializerMethodField()
    
    class Meta:
        model = WindowReplacement
        fields = [
            'uuid', 'building_name', 'project_name', 'old_thermal_conductivity',
            'new_thermal_conductivity', 'window_area', 'total_energy_savings',
            'annual_cost_savings', 'payback_period', 'efficiency_improvement',
            'created_at'
        ]

    def get_efficiency_improvement(self, obj):
        return obj.get_efficiency_improvement()
