from rest_framework import serializers
from .models import Material
from django.contrib.auth.models import User


class MaterialSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Material
        fields = [
            'uuid', 'name', 'category', 'category_display', 'thermal_conductivity', 
            'density', 'specific_heat', 'description', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MaterialListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing materials (e.g., in dropdowns)"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Material
        fields = [
            'uuid', 'name', 'category', 'category_display', 
            'thermal_conductivity', 'is_active'
        ]
