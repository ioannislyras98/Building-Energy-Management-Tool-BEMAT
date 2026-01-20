from rest_framework import serializers
from .models import BulbReplacement


class BulbReplacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulbReplacement
        fields = '__all__'
        read_only_fields = (
            'uuid', 'created_at', 'updated_at', 'user',
            'old_consumption_kwh', 'new_consumption_kwh',
            'energy_savings_kwh', 'total_investment_cost',
            'annual_cost_savings', 'payback_period', 'discounted_payback_period',
            'net_present_value', 'internal_rate_of_return'
        )

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class BulbReplacementListSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = BulbReplacement
        fields = [
            'uuid', 'building_name', 'project_name',
            'old_bulb_type', 'new_bulb_type',
            'energy_savings_kwh', 'annual_cost_savings',
            'payback_period', 'created_at'
        ]
