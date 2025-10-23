from rest_framework import serializers
from .models import BoilerReplacement


class BoilerReplacementSerializer(serializers.ModelSerializer):
    total_investment_cost = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    annual_energy_savings = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    annual_economic_benefit = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    payback_period = serializers.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        read_only=True
    )
    net_present_value = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    internal_rate_of_return = serializers.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = BoilerReplacement
        fields = [
            'id',
            'building',
            'project',
            # Στοιχεία Λέβητα
            'boiler_power',
            'boiler_cost',
            'installation_cost',
            'maintenance_cost',
            # Ενεργειακά Στοιχεία
            'heating_energy_savings',
            'energy_cost_kwh',
            # Παράμετροι Αξιολόγησης
            'time_period',
            'discount_rate',
            # Υπολογιζόμενα Πεδία
            'total_investment_cost',
            'annual_energy_savings',
            'annual_economic_benefit',
            'payback_period',
            'net_present_value',
            'internal_rate_of_return',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'total_investment_cost',
            'annual_energy_savings',
            'annual_economic_benefit',
            'payback_period',
            'net_present_value',
            'internal_rate_of_return',
        ]

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
                'boiler_power': "The field 'Boiler power' is required and must be greater than 0",
                'boiler_cost': "The field 'Boiler cost' is required and must be greater than 0", 
                'heating_energy_savings': "The field 'Heating energy savings' is required and must be greater than 0"
            },
            'el': {
                'boiler_power': "Το πεδίο 'Ισχύς λέβητα' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'boiler_cost': "Το πεδίο 'Κόστος λέβητα' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'heating_energy_savings': "Το πεδίο 'Εξοικονόμηση ενέργειας θέρμανσης' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0"
            }
        }
        
        messages = error_messages.get(language, error_messages['el'])
        
        required_fields = ['boiler_power', 'boiler_cost', 'heating_energy_savings']
        
        for field in required_fields:
            value = data.get(field)
            if value is None or value == '' or (isinstance(value, (int, float)) and value <= 0):
                raise serializers.ValidationError(messages[field])
        
        return data
