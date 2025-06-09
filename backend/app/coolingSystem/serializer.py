from rest_framework import serializers
from .models import CoolingSystem

class CoolingSystemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CoolingSystem
        fields = '__all__'
