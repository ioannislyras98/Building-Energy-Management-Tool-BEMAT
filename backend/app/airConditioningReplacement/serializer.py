from rest_framework import serializers
from .models import OldAirConditioning, NewAirConditioning, AirConditioningAnalysis


class OldAirConditioningSerializer(serializers.ModelSerializer):
    class Meta:
        model = OldAirConditioning
        fields = '__all__'
        read_only_fields = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                           'total_consumption_kwh', 'created_at', 'updated_at')


class NewAirConditioningSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewAirConditioning
        fields = '__all__'
        read_only_fields = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                           'total_consumption_kwh', 'total_cost', 'created_at', 'updated_at')


class AirConditioningAnalysisSerializer(serializers.ModelSerializer):
    project_electricity_cost = serializers.DecimalField(source='project.cost_per_kwh_electricity', read_only=True, max_digits=6, decimal_places=3)
    
    class Meta:
        model = AirConditioningAnalysis
        fields = '__all__'
        read_only_fields = ('id', 'total_old_consumption', 'total_new_consumption', 
                           'energy_savings_kwh', 'total_investment_cost', 'annual_cost_savings',
                           'payback_period', 'net_present_value', 'internal_rate_of_return',
                           'created_at', 'updated_at')


class OldAirConditioningCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OldAirConditioning
        exclude = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                  'total_consumption_kwh', 'created_at', 'updated_at')


class NewAirConditioningCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewAirConditioning
        exclude = ('id', 'heating_consumption_kwh', 'cooling_consumption_kwh', 
                  'total_consumption_kwh', 'total_cost', 'created_at', 'updated_at')


class AirConditioningAnalysisCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirConditioningAnalysis
        exclude = ('id', 'total_old_consumption', 'total_new_consumption', 
                  'energy_savings_kwh', 'total_investment_cost', 'annual_cost_savings',
                  'payback_period', 'net_present_value', 'internal_rate_of_return',
                  'created_at', 'updated_at')
