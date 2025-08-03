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
            'id',
            'building',
            'project',
            # Στοιχεία Συστήματος
            'lighting_area',
            'cost_per_m2',
            'installation_cost',
            'maintenance_cost',
            # Ενεργειακά Στοιχεία
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
        """Επιπλέον validations"""
        if data.get('lighting_area', 0) <= 0:
            raise serializers.ValidationError("Η επιφάνεια φωτισμού πρέπει να είναι μεγαλύτερη από 0")
        
        if data.get('cost_per_m2', 0) <= 0:
            raise serializers.ValidationError("Το κόστος ανά m² πρέπει να είναι μεγαλύτερο από 0")
            
        if data.get('lighting_energy_savings', 0) <= 0:
            raise serializers.ValidationError("Η εξοικονόμηση ενέργειας πρέπει να είναι μεγαλύτερη από 0")
        
        return data
