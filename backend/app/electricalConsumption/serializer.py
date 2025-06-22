from rest_framework import serializers
from .models import ElectricalConsumption
from thermalZone.serializer import ThermalZoneSerializer
from energyConsumption.serializers import EnergyConsumptionSerializer


class ElectricalConsumptionSerializer(serializers.ModelSerializer):
    annual_energy_consumption = serializers.ReadOnlyField()
    consumption_type_display = serializers.CharField(source='get_consumption_type_display', read_only=True)
    load_type_display = serializers.CharField(source='get_load_type_display', read_only=True)
    thermal_zone_data = ThermalZoneSerializer(source='thermal_zone', read_only=True)
    energy_consumption_data = EnergyConsumptionSerializer(source='energy_consumption', read_only=True)
    
    class Meta:
        model = ElectricalConsumption
        fields = '__all__'
