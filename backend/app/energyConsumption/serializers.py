from rest_framework import serializers
from .models import EnergyConsumption

class EnergyConsumptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyConsumption
        fields = [
            'uuid', 
            'project', 
            'building', 
            'energy_source', 
            'start_date', 
            'end_date', 
            'quantity',
            'unit',
            'kwh_equivalent', 
            'user' 
        ]
        read_only_fields = ['uuid', 'user', 'unit', 'kwh_equivalent']