from rest_framework import serializers
from .models import BoilerReplacement


class BoilerReplacementSerializer(serializers.ModelSerializer):
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
        """Επιπλέον validations"""
        if data.get('boiler_power', 0) <= 0:
            raise serializers.ValidationError("Η ισχύς λέβητα πρέπει να είναι μεγαλύτερη από 0")
        
        if data.get('boiler_cost', 0) <= 0:
            raise serializers.ValidationError("Το κόστος λέβητα πρέπει να είναι μεγαλύτερο από 0")
            
        if data.get('heating_energy_savings', 0) <= 0:
            raise serializers.ValidationError("Η εξοικονόμηση ενέργειας πρέπει να είναι μεγαλύτερη από 0")
        
        return data
