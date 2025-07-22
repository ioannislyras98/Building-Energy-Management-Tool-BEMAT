from rest_framework import serializers
from .models import PhotovoltaicSystem

class PhotovoltaicSystemSerializer(serializers.ModelSerializer):
    # Calculated fields (read-only)
    total_equipment_cost = serializers.SerializerMethodField()
    calculated_unexpected_expenses = serializers.SerializerMethodField()
    calculated_value_after_unexpected = serializers.SerializerMethodField()
    calculated_tax_burden = serializers.SerializerMethodField()
    calculated_total_cost = serializers.SerializerMethodField()
    
    # Related fields
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
            
            # Εξοπλισμός - Φωτοβολταϊκά πλαίσια
            'pv_panels_quantity',
            'pv_panels_unit_price',
            'pv_panels_cost',
            
            # Μεταλλικές βάσεις στήριξης
            'metal_bases_quantity',
            'metal_bases_unit_price',
            'metal_bases_cost',
            
            # Σωληνώσεις
            'piping_quantity',
            'piping_unit_price',
            'piping_cost',
            
            # Καλωδιώσεις
            'wiring_quantity',
            'wiring_unit_price',
            'wiring_cost',
            
            # Μετατροπέας ισχύος
            'inverter_quantity',
            'inverter_unit_price',
            'inverter_cost',
            
            # Εγκατάσταση
            'installation_quantity',
            'installation_unit_price',
            'installation_cost',
            
            # Οικονομικοί Δείκτες
            'estimated_cost',
            'unexpected_expenses',
            'value_after_unexpected',
            'tax_burden',
            'total_cost',
            
            # Ενεργειακοί Δείκτες
            'power_per_panel',
            'collector_efficiency',
            'installation_angle',
            'pv_usage',
            'pv_system_type',
            
            # Calculated fields
            'total_equipment_cost',
            'calculated_unexpected_expenses',
            'calculated_value_after_unexpected',
            'calculated_tax_burden',
            'calculated_total_cost',
            
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

class PhotovoltaicSystemCreateSerializer(serializers.ModelSerializer):
    """Serializer για δημιουργία νέου φωτοβολταϊκού συστήματος"""
    
    class Meta:
        model = PhotovoltaicSystem
        fields = [
            'user',
            'building',
            'project',
            
            # Εξοπλισμός - Φωτοβολταϊκά πλαίσια
            'pv_panels_quantity',
            'pv_panels_unit_price',
            
            # Μεταλλικές βάσεις στήριξης
            'metal_bases_quantity',
            'metal_bases_unit_price',
            
            # Σωληνώσεις
            'piping_quantity',
            'piping_unit_price',
            
            # Καλωδιώσεις
            'wiring_quantity',
            'wiring_unit_price',
            
            # Μετατροπέας ισχύος
            'inverter_quantity',
            'inverter_unit_price',
            
            # Εγκατάσταση
            'installation_quantity',
            'installation_unit_price',
            
            # Ενεργειακοί Δείκτες
            'power_per_panel',
            'collector_efficiency',
            'installation_angle',
            'pv_usage',
            'pv_system_type',
        ]
    
    def validate(self, data):
        """Επικύρωση δεδομένων"""
        # Έλεγχος ότι building και project ανήκουν στον ίδιο χρήστη
        if 'building' in data and 'project' in data:
            if data['building'].project != data['project']:
                raise serializers.ValidationError(
                    "Το κτίριο και το έργο πρέπει να ανήκουν στον ίδιο χρήστη."
                )
        
        return data
