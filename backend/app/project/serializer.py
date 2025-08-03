from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    buildings_count = serializers.ReadOnlyField()  # Αυτό διαβάζει το @property
    completion_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['uuid', 'name', 'user', 'buildings_count', 'cost_per_kwh_fuel', 
                 'cost_per_kwh_electricity', 'date_created', 'is_submitted', 'completion_status']
    
    def get_completion_status(self, obj):
        """Get the completion status for this project"""
        return obj.get_completion_status()