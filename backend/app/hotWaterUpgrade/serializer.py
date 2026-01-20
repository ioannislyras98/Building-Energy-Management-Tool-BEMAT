from rest_framework import serializers
from .models import HotWaterUpgrade


class HotWaterUpgradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotWaterUpgrade
        fields = '__all__'
        read_only_fields = [
            'solar_collectors_subtotal',
            'metal_support_bases_subtotal',
            'solar_system_subtotal',
            'insulated_pipes_subtotal',
            'central_heater_installation_subtotal',
            'total_investment_cost',
            'annual_energy_consumption_kwh',
            'annual_solar_savings_kwh',
            'annual_economic_benefit',
            'payback_period',
            'discounted_payback_period',
            'net_present_value',
            'internal_rate_of_return',
            'created_at',
            'updated_at'
        ]
