from rest_framework import serializers
from .models import ElectricalConsumption


class ElectricalConsumptionSerializer(serializers.ModelSerializer):
    annual_energy_consumption = serializers.ReadOnlyField()
    consumption_type_display = serializers.CharField(source='get_consumption_type_display', read_only=True)
    load_type_display = serializers.CharField(source='get_load_type_display', read_only=True)
    
    class Meta:
        model = ElectricalConsumption
        fields = '__all__'
