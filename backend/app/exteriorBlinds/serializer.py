from rest_framework import serializers
from .models import ExteriorBlinds


class ExteriorBlindsSerializer(serializers.ModelSerializer):
    """Serializer for ExteriorBlinds model"""
    
    total_investment_cost = serializers.FloatField(read_only=True)
    annual_energy_savings = serializers.FloatField(read_only=True)
    annual_economic_benefit = serializers.FloatField(read_only=True)
    payback_period = serializers.FloatField(read_only=True)
    net_present_value = serializers.FloatField(read_only=True)
    internal_rate_of_return = serializers.FloatField(read_only=True)
    
    class Meta:
        model = ExteriorBlinds
        fields = [
            'uuid', 'building', 'project',
            'window_area', 'cost_per_m2', 'installation_cost', 'maintenance_cost',
            'cooling_energy_savings', 'energy_cost_kwh',
            'time_period', 'discount_rate',
            'total_investment_cost', 'annual_energy_savings', 'annual_economic_benefit',
            'payback_period', 'net_present_value', 'internal_rate_of_return',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uuid', 'created_at', 'updated_at',
            'total_investment_cost', 'annual_energy_savings', 'annual_economic_benefit',
            'payback_period', 'net_present_value', 'internal_rate_of_return'
        ]
    
    def to_internal_value(self, data):
        """Προ-επεξεργασία δεδομένων εισόδου"""
        for field in ['window_area', 'cost_per_m2', 'installation_cost', 'maintenance_cost',
                      'cooling_energy_savings', 'energy_cost_kwh', 'time_period', 'discount_rate']:
            if field in data and data[field] == '':
                data[field] = None
        
        return super().to_internal_value(data)
    
    def validate(self, data):
        """Δυναμικά multilingual validations"""
        request = self.context.get('request')
        language = 'el'
        if request and hasattr(request, 'META'):
            accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
            if 'en' in accept_language.lower():
                language = 'en'
        
        error_messages = {
            'en': {
                'window_area': "The field 'Window area' is required and must be greater than 0",
                'cost_per_m2': "The field 'Cost per m²' is required and must be greater than 0", 
                'cooling_energy_savings': "The field 'Cooling energy savings' is required and must be greater than 0"
            },
            'el': {
                'window_area': "Το πεδίο 'Επιφάνεια παραθύρων' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'cost_per_m2': "Το πεδίο 'Κόστος ανά m²' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'cooling_energy_savings': "Το πεδίο 'Εξοικονόμηση ενέργειας ψύξης' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0"
            }
        }
        
        messages = error_messages.get(language, error_messages['el'])
        
        required_fields = ['window_area', 'cost_per_m2', 'cooling_energy_savings']
        
        for field in required_fields:
            value = data.get(field)
            if value is None or value == '' or (isinstance(value, (int, float)) and value <= 0):
                raise serializers.ValidationError(messages[field])
        
        return data
    
    def validate_window_area(self, value):
        """Επικύρωση επιφάνειας παραθύρων"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Η επιφάνεια παραθύρων πρέπει να είναι μεγαλύτερη από 0")
        return value
    
    def validate_cost_per_m2(self, value):
        """Επικύρωση κόστους ανά m²"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Το κόστος ανά m² δεν μπορεί να είναι αρνητικό")
        return value
    
    def validate_cooling_energy_savings(self, value):
        """Επικύρωση εξοικονόμησης ενέργειας"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Η εξοικονόμηση ενέργειας δεν μπορεί να είναι αρνητική")
        return value
