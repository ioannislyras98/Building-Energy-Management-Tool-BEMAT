from rest_framework import serializers
from .models import PhotovoltaicSystem

class PhotovoltaicSystemSerializer(serializers.ModelSerializer):
    
    total_equipment_cost = serializers.SerializerMethodField()
    calculated_unexpected_expenses = serializers.SerializerMethodField()
    calculated_value_after_unexpected = serializers.SerializerMethodField()
    calculated_tax_burden = serializers.SerializerMethodField()
    calculated_total_cost = serializers.SerializerMethodField()
    calculated_annual_savings = serializers.SerializerMethodField()
    calculated_payback_period = serializers.SerializerMethodField()
    calculated_investment_return = serializers.SerializerMethodField()
    calculated_net_present_value = serializers.SerializerMethodField()
    
    building_name = serializers.CharField(source='building.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PhotovoltaicSystem
        fields = [
            'uuid',
            'user',
            'building',
            'project',
            'user_name',
            'building_name',
            'project_name',
            
            'pv_panels_quantity',
            'pv_panels_unit_price',
            'pv_panels_cost',
            
            'metal_bases_quantity',
            'metal_bases_unit_price',
            'metal_bases_cost',
            
            'piping_quantity',
            'piping_unit_price',
            'piping_cost',
            
            'wiring_quantity',
            'wiring_unit_price',
            'wiring_cost',
            
            'inverter_quantity',
            'inverter_unit_price',
            'inverter_cost',
            
            'installation_quantity',
            'installation_unit_price',
            'installation_cost',
            
            'estimated_cost',
            'unexpected_expenses',
            'value_after_unexpected',
            'tax_burden',
            'total_cost',
            'subsidy_amount',
            'net_cost',
            'net_present_value',
            'payback_period',
            'annual_savings',
            'investment_return',
            
            'power_per_panel',
            'collector_efficiency',
            'installation_angle',
            'pv_usage',
            'pv_system_type',
            'annual_energy_production',
            'carbon_footprint_reduction',
            
            'total_equipment_cost',
            'calculated_unexpected_expenses',
            'calculated_value_after_unexpected',
            'calculated_tax_burden',
            'calculated_total_cost',
            'calculated_annual_savings',
            'calculated_payback_period',
            'calculated_investment_return',
            'calculated_net_present_value',
            
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']
    
    def get_total_equipment_cost(self, obj):
        """Υπολογισμός συνολικού κόστους εξοπλισμού"""
        return obj.calculate_total_equipment_cost()
    
    def get_calculated_unexpected_expenses(self, obj):
        """Υπολογισμός απρόβλεπτων δαπανών"""
        return obj.calculate_unexpected_expenses()
    
    def get_calculated_value_after_unexpected(self, obj):
        """Υπολογισμός αξίας μετά τις απρόβλεπτες δαπάνες"""
        return obj.calculate_value_after_unexpected()
    
    def get_calculated_tax_burden(self, obj):
        """Υπολογισμός επιβάρυνσης φόρου"""
        return obj.calculate_tax_burden()
    
    def get_calculated_total_cost(self, obj):
        """Υπολογισμός συνολικού κόστους"""
        return obj.calculate_total_cost()
    
    def get_calculated_annual_savings(self, obj):
        """Υπολογισμός ετήσιων εξοικονομήσεων"""
        return obj.calculate_annual_savings()
    
    def get_calculated_payback_period(self, obj):
        """Υπολογισμός περιόδου απόσβεσης"""
        return obj.calculate_payback_period()
    
    def get_calculated_investment_return(self, obj):
        """Υπολογισμός απόδοσης επένδυσης"""
        return obj.calculate_investment_return()
    
    def get_calculated_net_present_value(self, obj):
        """Υπολογισμός καθαρής παρούσας αξίας"""
        return obj.calculate_net_present_value()

class PhotovoltaicSystemCreateSerializer(serializers.ModelSerializer):
    """Serializer για δημιουργία νέου φωτοβολταϊκού συστήματος"""
    
    class Meta:
        model = PhotovoltaicSystem
        fields = [
            'building',
            'project',
            
            'pv_panels_quantity',
            'pv_panels_unit_price',
            
            'metal_bases_quantity',
            'metal_bases_unit_price',
            
            'piping_quantity',
            'piping_unit_price',
            
            'wiring_quantity',
            'wiring_unit_price',
            
            'inverter_quantity',
            'inverter_unit_price',
            
            'installation_quantity',
            'installation_unit_price',
            
            'subsidy_amount',
            
            'power_per_panel',
            'collector_efficiency',
            'installation_angle',
            'pv_usage',
            'pv_system_type',
            'annual_energy_production',
            'carbon_footprint_reduction',
        ]
    
    def validate(self, data):
        """Επικύρωση δεδομένων"""
        if 'building' in data and 'project' in data:
            if data['building'].project != data['project']:
                raise serializers.ValidationError(
                    "Το κτίριο και το έργο πρέπει να ανήκουν στον ίδιο χρήστη."
                )
        
        return data
