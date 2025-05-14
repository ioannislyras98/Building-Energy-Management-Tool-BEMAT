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
            'user' 
        ]
        read_only_fields = ['uuid', 'user']