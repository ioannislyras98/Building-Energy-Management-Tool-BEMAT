from rest_framework import serializers
from .models import DomesticHotWaterSystem

class DomesticHotWaterSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomesticHotWaterSystem
        fields = '__all__'
