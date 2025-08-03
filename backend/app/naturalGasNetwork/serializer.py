from rest_framework import serializers
from .models import NaturalGasNetwork


class NaturalGasNetworkSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    def to_internal_value(self, data):
        """
        Convert empty strings to appropriate default values before validation
        """
        # Make a copy of the data to avoid modifying the original
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Fields that should default to 0.0 when empty
        zero_default_fields = [
            'burner_replacement_quantity',
            'burner_replacement_unit_price',
            'gas_pipes_quantity',
            'gas_pipes_unit_price',
            'gas_detection_systems_quantity',
            'gas_detection_systems_unit_price',
            'boiler_cleaning_quantity',
            'boiler_cleaning_unit_price',
        ]
        
        # Fields that should default to None when empty
        none_default_fields = [
            'current_energy_cost_per_year',
            'natural_gas_cost_per_year',
            'annual_energy_savings',
            'natural_gas_price_per_kwh',
        ]
        
        # Fields that should default to specific values when empty
        specific_default_fields = {
            'new_system_efficiency': 0.90,
        }
        
        # Convert empty strings to 0.0 for zero default fields
        for field in zero_default_fields:
            if field in data and (data[field] == "" or data[field] is None):
                data[field] = 0.0
        
        # Convert empty strings to None for none default fields
        for field in none_default_fields:
            if field in data and data[field] == "":
                data[field] = None
        
        # Convert empty strings to specific defaults
        for field, default_value in specific_default_fields.items():
            if field in data and (data[field] == "" or data[field] is None):
                data[field] = default_value
        
        return super().to_internal_value(data)
    
    class Meta:
        model = NaturalGasNetwork
        fields = [
            'id',
            'building',
            'building_name',
            'project',
            'project_name',
            # System Components
            'burner_replacement_quantity',
            'burner_replacement_unit_price',
            'gas_pipes_quantity',
            'gas_pipes_unit_price',
            'gas_detection_systems_quantity',
            'gas_detection_systems_unit_price',
            'boiler_cleaning_quantity',
            'boiler_cleaning_unit_price',
            # Economic Data
            'current_energy_cost_per_year',
            'natural_gas_cost_per_year',
            'annual_energy_savings',
            'lifespan_years',
            'new_system_efficiency',
            'natural_gas_price_per_kwh',
            # Calculated Results
            'burner_replacement_subtotal',
            'gas_pipes_subtotal',
            'gas_detection_systems_subtotal',
            'boiler_cleaning_subtotal',
            'total_investment_cost',
            'annual_economic_benefit',
            'payback_period',
            'net_present_value',
            'internal_rate_of_return',
            # Metadata
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'building_name',
            'project_name',
            'burner_replacement_subtotal',
            'gas_pipes_subtotal',
            'gas_detection_systems_subtotal',
            'boiler_cleaning_subtotal',
            'total_investment_cost',
            'annual_economic_benefit',
            'payback_period',
            'net_present_value',
            'internal_rate_of_return',
            'created_at',
            'updated_at',
        ]
    
    def validate(self, data):
        """
        Validate the natural gas network data
        """
        # Ensure quantities are positive
        quantity_fields = [
            'burner_replacement_quantity',
            'gas_pipes_quantity', 
            'gas_detection_systems_quantity',
            'boiler_cleaning_quantity'
        ]
        
        for field in quantity_fields:
            if field in data and data[field] is not None and data[field] < 0:
                raise serializers.ValidationError(f"{field} must be a positive number")
        
        # Ensure prices are positive
        price_fields = [
            'burner_replacement_unit_price',
            'gas_pipes_unit_price',
            'gas_detection_systems_unit_price',
            'boiler_cleaning_unit_price'
        ]
        
        for field in price_fields:
            if field in data and data[field] is not None and data[field] < 0:
                raise serializers.ValidationError(f"{field} must be a positive number")
        
        # Ensure energy costs are positive if provided (except annual_energy_savings which can be negative)
        energy_fields = [
            'current_energy_cost_per_year',
            'natural_gas_cost_per_year',
        ]
        
        for field in energy_fields:
            if field in data and data[field] is not None and data[field] < 0:
                raise serializers.ValidationError(f"{field} must be a positive number")
        
        # Annual energy savings can be negative (when natural gas costs more than current system)
        # No validation needed for annual_energy_savings
        
        # Ensure lifespan is positive
        if 'lifespan_years' in data and data['lifespan_years'] is not None and data['lifespan_years'] <= 0:
            raise serializers.ValidationError("lifespan_years must be a positive number")
        
        # Ensure system efficiency is between 0.1 and 1.0
        if 'new_system_efficiency' in data and data['new_system_efficiency'] is not None:
            if data['new_system_efficiency'] < 0.1 or data['new_system_efficiency'] > 1.0:
                raise serializers.ValidationError("new_system_efficiency must be between 0.1 and 1.0")
        
        # Ensure natural gas price is positive if provided
        if 'natural_gas_price_per_kwh' in data and data['natural_gas_price_per_kwh'] is not None and data['natural_gas_price_per_kwh'] < 0:
            raise serializers.ValidationError("natural_gas_price_per_kwh must be a positive number")
        
        return data
