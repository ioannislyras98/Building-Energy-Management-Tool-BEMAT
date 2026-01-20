from rest_framework import serializers
from .models import AutomaticLightingControl


class AutomaticLightingControlSerializer(serializers.ModelSerializer):
    # Υπολογιζόμενα πεδία ως read-only
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
    discounted_payback_period = serializers.DecimalField(
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
        model = AutomaticLightingControl
        fields = [
            'uuid',
            'building',
            'project',
            # Στοιχεία Συστήματος
            'lighting_area',
            'cost_per_m2',
            'installation_cost',
            'maintenance_cost',
            # Ενεργειακά Στοιχεία - Τρέχοντα
            'current_lighting_power_density',
            'operating_hours_per_day',
            'operating_days_per_year',
            'estimated_savings_percentage',
            # Ενεργειακά Στοιχεία - Υπολογιζόμενα
            'lighting_energy_savings',
            'energy_cost_kwh',
            # Παράμετροι Αξιολόγησης
            'time_period',
            'discount_rate',
            # Υπολογιζόμενα Πεδία
            'total_investment_cost',
            'annual_energy_savings',
            'annual_economic_benefit',
            'payback_period',
            'discounted_payback_period',
            'net_present_value',
            'internal_rate_of_return',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'uuid',
            'created_at',
            'updated_at',
            'lighting_energy_savings',
            'energy_cost_kwh',
            'total_investment_cost',
            'annual_energy_savings',
            'annual_economic_benefit',
            'payback_period',
            'discounted_payback_period',
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
                'lighting_area': "The field 'Lighting area' is required and must be greater than 0",
                'cost_per_m2': "The field 'Cost per m²' is required and must be greater than 0", 
                'current_lighting_power_density': "The field 'Current lighting power density' is required and must be greater than 0"
            },
            'el': {
                'lighting_area': "Το πεδίο 'Επιφάνεια φωτισμού' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'cost_per_m2': "Το πεδίο 'Κόστος ανά m²' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0",
                'current_lighting_power_density': "Το πεδίο 'Τρέχουσα ισχύς φωτισμού' είναι υποχρεωτικό και πρέπει να είναι μεγαλύτερο από 0"
            }
        }
        
        messages = error_messages.get(language, error_messages['el'])
        
        # Προσθήκη μηνυμάτων για installation_cost και maintenance_cost
        error_messages['en']['installation_cost'] = "The field 'Installation cost' is required"
        error_messages['en']['maintenance_cost'] = "The field 'Maintenance cost' is required"
        error_messages['el']['installation_cost'] = "Το πεδίο 'Κόστος εγκατάστασης' είναι υποχρεωτικό"
        error_messages['el']['maintenance_cost'] = "Το πεδίο 'Ετήσιο κόστος συντήρησης' είναι υποχρεωτικό"
        
        messages = error_messages.get(language, error_messages['el'])
        
        required_fields = ['lighting_area', 'cost_per_m2', 'current_lighting_power_density', 'installation_cost', 'maintenance_cost']
        
        for field in required_fields:
            value = data.get(field)
            if value is None or value == '':
                raise serializers.ValidationError(messages[field])
            # Για αριθμητικά πεδία, έλεγχος > 0 μόνο για τα πρώτα 3
            if field in ['lighting_area', 'cost_per_m2', 'current_lighting_power_density']:
                if isinstance(value, (int, float)) and value <= 0:
                    raise serializers.ValidationError(messages[field])
        
        return data
