from rest_framework import serializers
from .models import CoolingSystem

class CoolingSystemSerializer(serializers.ModelSerializer):
    cooling_system_type_display = serializers.CharField(source='get_cooling_system_type_display', read_only=True)
    cooling_unit_accessibility_display = serializers.CharField(source='get_cooling_unit_accessibility_display', read_only=True)
    
    class Meta:
        model = CoolingSystem
        fields = '__all__'
        
    def to_representation(self, instance):
        """
        Προσθέτει τις εμφανιζόμενες τιμές των choices στο API response
        """
        data = super().to_representation(instance)
        if instance.cooling_system_type:
            data['cooling_system_type_display'] = instance.get_cooling_system_type_display()
        if instance.cooling_unit_accessibility:
            data['cooling_unit_accessibility_display'] = instance.get_cooling_unit_accessibility_display()
        return data
