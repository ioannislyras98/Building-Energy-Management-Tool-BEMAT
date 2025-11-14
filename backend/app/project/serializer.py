from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    buildings_count = serializers.ReadOnlyField()
    completion_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['uuid', 'name', 'user', 'buildings_count',
                 'oil_price_per_liter', 'natural_gas_price_per_m3', 'biomass_price_per_kg',
                 'cost_per_kwh_electricity', 'date_created', 'is_submitted', 'completion_status']
    
    def get_completion_status(self, obj):
        """Get the completion status for this project"""
        return obj.get_completion_status()