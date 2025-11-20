from rest_framework import serializers
from .models import BoilerReplacement


class BoilerReplacementSerializer(serializers.ModelSerializer):
    heating_oil_savings_liters = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
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
            'uuid',
            'building',
            'project',
            # Στοιχεία Λέβητα
            'old_boiler_efficiency',
            'new_boiler_efficiency',
            'boiler_cost',
            'installation_cost',
            'maintenance_cost',
            # Ενεργειακά Στοιχεία
            'annual_heating_consumption_liters',
            'heating_oil_savings_liters',
            'oil_price_per_liter',
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
            'uuid',
            'created_at',
            'updated_at',
            'heating_oil_savings_liters',
            'oil_price_per_liter',
            'total_investment_cost',
            'annual_energy_savings',
            'annual_economic_benefit',
            'payback_period',
            'net_present_value',
            'internal_rate_of_return',
        ]

    def validate_installation_cost(self, value):
        """Handle empty strings for installation_cost"""
        if value == '' or value is None:
            return 0
        return value
    
    def validate_maintenance_cost(self, value):
        """Handle empty strings for maintenance_cost"""
        if value == '' or value is None:
            return 0
        return value

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
                'old_boiler_efficiency': "The field 'Old boiler efficiency' is required and must be between 0.1% and 100%",
                'new_boiler_efficiency': "The field 'New boiler efficiency' is required and must be between 0.1% and 100%",
                'boiler_cost': "The field 'Boiler cost' is required and must be greater than 0",
                'annual_heating_consumption_liters': "The field 'Annual heating consumption' is required and must be greater than 0",
                'efficiency_improvement': "The new boiler efficiency must be higher than the old boiler efficiency"
            },
            'el': {
                'old_boiler_efficiency': "Το πεδίο 'Απόδοση παλιού λέβητα' είναι υποχρεωτικό και πρέπει να είναι μεταξύ 0.1% και 100%",
                'new_boiler_efficiency': "Το πεδίο 'Απόδοση νέου λέβητα' είναι υποχρεωτικό και πρέπει να είναι μεταξύ 0.1% και 100%",
                'boiler_cost': "Το πεδίο 'Κόστος λέβητα' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'annual_heating_consumption_liters': "Το πεδίο 'Ετήσια κατανάλωση θέρμανσης' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'efficiency_improvement': "Η απόδοση του νέου λέβητα πρέπει να είναι μεγαλύτερη από την απόδοση του παλιού λέβητα"
            }
        }
        
        messages = error_messages.get(language, error_messages['el'])
        
        # Έλεγχος υποχρεωτικών πεδίων
        required_numeric_fields = [
            'boiler_cost', 'annual_heating_consumption_liters'
        ]
        
        for field in required_numeric_fields:
            value = data.get(field)
            if value is None or value == '' or (isinstance(value, (int, float)) and value <= 0):
                raise serializers.ValidationError({field: messages[field]})
        
        # Έλεγχος συντελεστών απόδοσης
        efficiency_fields = ['old_boiler_efficiency', 'new_boiler_efficiency']
        for field in efficiency_fields:
            value = data.get(field)
            if value is None or value == '' or (isinstance(value, (int, float)) and (value <= 0.1 or value > 100)):
                raise serializers.ValidationError({field: messages[field]})
        
        # Έλεγχος ότι η νέα απόδοση είναι καλύτερη από την παλιά
        old_efficiency = data.get('old_boiler_efficiency')
        new_efficiency = data.get('new_boiler_efficiency')
        if old_efficiency and new_efficiency and float(new_efficiency) <= float(old_efficiency):
            raise serializers.ValidationError({'new_boiler_efficiency': messages['efficiency_improvement']})
        
        return data
