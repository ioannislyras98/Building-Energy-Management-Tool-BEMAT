from rest_framework import serializers
from .models import HeatingSystem

class HeatingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeatingSystem
        fields = '__all__'