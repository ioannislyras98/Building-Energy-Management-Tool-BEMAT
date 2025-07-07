from rest_framework import serializers
from .models import Prefecture
from django.contrib.auth.models import User


class PrefectureSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    zone_display = serializers.CharField(source='get_zone_display', read_only=True)
    
    class Meta:
        model = Prefecture
        fields = [
            'uuid', 'name', 'zone', 'zone_display', 'temperature_winter', 
            'temperature_summer', 'is_active', 'created_at', 'updated_at', 
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PrefectureListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing prefectures (e.g., in dropdowns)"""
    zone_display = serializers.CharField(source='get_zone_display', read_only=True)
    
    class Meta:
        model = Prefecture
        fields = ['uuid', 'name', 'zone', 'zone_display', 'temperature_winter', 'temperature_summer']
