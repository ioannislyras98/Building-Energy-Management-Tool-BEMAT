from rest_framework import serializers
from .models import SolarCollector

class SolarCollectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolarCollector
        fields = '__all__'
