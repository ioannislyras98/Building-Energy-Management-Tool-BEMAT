from rest_framework import serializers
from .models import ThermalZone


class ThermalZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThermalZone
        fields = '__all__'
