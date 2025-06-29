from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()


class ExternalWallThermalInsulation(models.Model):
    """
    External wall thermal insulation system with materials and U-value calculation
    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Χρήστης")
    building = models.ForeignKey(
        'building.Building', 
        on_delete=models.CASCADE, 
        verbose_name="Κτίριο"
    )
    project = models.ForeignKey(
        'project.Project', 
        on_delete=models.CASCADE, 
        verbose_name="Έργο"
    )
    
    # Calculated fields
    u_coefficient = models.FloatField(
        verbose_name="Συντελεστής U (W/m²K)",
        help_text="Υπολογίζεται αυτόματα: U = 1/R_total",
        null=True,
        blank=True
    )
    winter_hourly_losses = models.FloatField(
        verbose_name="Ωριαίες απώλειες χειμερινών μηνών (kW)",
        null=True,
        blank=True
    )
    summer_hourly_losses = models.FloatField(
        verbose_name="Ωριαίες απώλειες θερινών μηνών (kW)",
        null=True,
        blank=True
    )
    
    # Heating and Cooling Hours
    heating_hours_per_year = models.FloatField(
        verbose_name="Ώρες θέρμανσης ανά έτος",
        null=True,
        blank=True,
        help_text="Ώρες λειτουργίας θέρμανσης ανά έτος"
    )
    cooling_hours_per_year = models.FloatField(
        verbose_name="Ώρες ψύξης ανά έτος",
        null=True,
        blank=True,
        help_text="Ώρες λειτουργίας ψύξης ανά έτος"
    )
    
    # Economic Analysis
    total_cost = models.FloatField(
        verbose_name="Συνολικό κόστος (€)",
        null=True,
        blank=True,
        help_text="Συνολικό κόστος υλικών και εργασίας"
    )
    annual_benefit = models.FloatField(
        verbose_name="Ετήσιο όφελος (€)",
        null=True,
        blank=True,
        help_text="Ετήσιο όφελος από εξοικονόμηση ενέργειας"
    )
    time_period_years = models.IntegerField(
        verbose_name="Χρονικό διάστημα (έτη)",
        null=True,
        blank=True,
        help_text="Περίοδος αξιολόγησης της επένδυσης σε έτη"
    )
    annual_operating_costs = models.FloatField(
        verbose_name="Λειτουργικά έξοδα ανά έτος (€)",
        null=True,
        blank=True,
        help_text="Ετήσια λειτουργικά και συντήρησης έξοδα"
    )
    discount_rate = models.FloatField(
        verbose_name="Επιτόκιο αναγωγής (%)",
        null=True,
        blank=True,
        help_text="Επιτόκιο αναγωγής για υπολογισμό NPV"
    )
    net_present_value = models.FloatField(
        verbose_name="Καθαρή παρούσα αξία (€)",
        null=True,
        blank=True,
        help_text="Καθαρή παρούσα αξία της επένδυσης"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")

    class Meta:
        verbose_name = "Θερμομόνωση Εξωτερικής Τοιχοποιίας"
        verbose_name_plural = "Θερμομονώσεις Εξωτερικής Τοιχοποιίας"
        ordering = ['-created_at']

    def __str__(self):
        return f"Θερμομόνωση {self.building.name} - U: {self.u_coefficient}"

    def calculate_u_coefficient(self):
        """
        Calculate U coefficient based on NEW materials only
        U = 1/R_total
        R_total = R_si + R_se + ΣR_materials
        R_si = 0.13 m²K/W (internal)
        R_se = 0.04 m²K/W (external)
        """
        R_si = 0.13  # Internal surface resistance
        R_se = 0.04  # External surface resistance
        
        # Calculate sum of all NEW material resistances only
        materials_r_sum = 0
        for material_layer in self.material_layers.filter(material_type='new'):
            if material_layer.material.thermal_conductivity > 0:
                r_material = material_layer.thickness / material_layer.material.thermal_conductivity
                materials_r_sum += r_material
        r_total = R_si + R_se + materials_r_sum
        if r_total > 0:
            return 1 / r_total
        return 0

    def calculate_npv(self):
        """Calculate Net Present Value"""
        try:
            # Check for required fields and convert to float to ensure they're not None
            if (not self.annual_benefit or not self.annual_operating_costs or 
                not self.discount_rate or not self.time_period_years or not self.total_cost):
                return 0
            
            annual_benefit = float(self.annual_benefit or 0)
            annual_operating_costs = float(self.annual_operating_costs or 0)
            discount_rate = float(self.discount_rate or 0)
            time_period_years = int(self.time_period_years or 0)
            total_cost = float(self.total_cost or 0)
            
            if total_cost <= 0:
                return 0
                
            npv = -total_cost  # Initial investment (negative)
            annual_net_benefit = annual_benefit - annual_operating_costs
            discount_rate_decimal = discount_rate / 100
            
            for year in range(1, time_period_years + 1):
                npv += annual_net_benefit / ((1 + discount_rate_decimal) ** year)
            return round(npv, 2)  # Round to 2 decimal places
        except (TypeError, ValueError, ZeroDivisionError) as e:
            print(f"Error calculating NPV: {e}")
            return 0

    def calculate_annual_benefit(self):
        """
        Calculate annual benefit from energy savings
        Formula: (difference in winter hourly losses × cooling hours per year + 
                  difference in summer hourly losses × heating hours per year) × electricity cost per kWh
        """
        try:
            # Check for required values with safe defaults
            heating_hours = float(self.heating_hours_per_year or 0)
            cooling_hours = float(self.cooling_hours_per_year or 0)
            
            if heating_hours <= 0 and cooling_hours <= 0:
                return 0
            
            # Check project and electricity cost
            if not self.project:
                return 0
                
            electricity_cost = 0
            if hasattr(self.project, 'cost_per_kwh_electricity') and self.project.cost_per_kwh_electricity:
                electricity_cost = float(self.project.cost_per_kwh_electricity)
            else:
                return 0
        
            # Calculate hourly losses for old and new materials
            old_materials = self.material_layers.filter(material_type='old')
            new_materials = self.material_layers.filter(material_type='new')
        
            # Calculate winter hourly losses (kW) for both old and new materials
            winter_losses_old = self._calculate_hourly_losses(old_materials, 72)  # 72°C difference for winter
            winter_losses_new = self._calculate_hourly_losses(new_materials, 72)
        
            # Calculate summer hourly losses (kW) for both old and new materials  
            summer_losses_old = self._calculate_hourly_losses(old_materials, 12.5)  # 12.5°C difference for summer
            summer_losses_new = self._calculate_hourly_losses(new_materials, 12.5)
        
            # Calculate differences (savings)
            winter_losses_difference = winter_losses_old - winter_losses_new
            summer_losses_difference = summer_losses_old - summer_losses_new            # Calculate annual energy savings (kWh/year)
            annual_energy_savings = (
                winter_losses_difference * cooling_hours +
                summer_losses_difference * heating_hours
            )
            
            # Calculate annual benefit (€/year)
            annual_benefit = annual_energy_savings * electricity_cost
        
            return max(0, annual_benefit)  # Ensure non-negative value
        except Exception as e:
            print(f"Error calculating annual benefit: {e}")
            return 0

    def _calculate_hourly_losses(self, materials, temperature_difference):
        """
        Helper method to calculate hourly losses for a set of materials
        Formula: U × A × ΔT / 1000 (kW)
        """
        if not materials.exists():
            return 0
        
        # Calculate U coefficient for these materials
        R_si = 0.13  # Internal surface resistance
        R_se = 0.04  # External surface resistance
        
        materials_r_sum = 0
        total_area = 0
        
        for material_layer in materials:
            try:
                # Safe access to attributes with None checks
                thickness = float(material_layer.thickness or 0)
                thermal_conductivity = float(material_layer.material.thermal_conductivity or 1)
                surface_area = float(material_layer.surface_area or 0)
                
                if thermal_conductivity > 0 and thickness > 0:
                    r_material = thickness / thermal_conductivity
                    materials_r_sum += r_material
                
                total_area += surface_area
            except (AttributeError, TypeError, ValueError):
                # Skip this material if there are any issues
                continue
        
        r_total = R_si + R_se + materials_r_sum
        u_coefficient = 1 / r_total if r_total > 0 else 0
        
        # Calculate hourly losses: U × A × ΔT / 1000 (kW)
        hourly_losses = (u_coefficient * total_area * temperature_difference) / 1000
        return hourly_losses

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate U coefficient, annual benefit, and NPV after saving
        try:
            self.u_coefficient = self.calculate_u_coefficient()
            self.annual_benefit = self.calculate_annual_benefit()
            self.net_present_value = self.calculate_npv()
            if self.pk:  # Only update if object exists (avoid recursion)
                ExternalWallThermalInsulation.objects.filter(pk=self.pk).update(
                    u_coefficient=self.u_coefficient,
                    annual_benefit=self.annual_benefit,
                    net_present_value=self.net_present_value
                )
        except Exception as e:
            # Log the error but don't crash the save operation
            print(f"Error calculating thermal insulation values: {e}")
            pass


class ThermalInsulationMaterialLayer(models.Model):
    """
    Individual material layers in a thermal insulation system
    """
    SURFACE_TYPE_CHOICES = [
        ('external_walls_outdoor', 'Εξωτερικοί τοίχοι σε επαφή με τον εξωτερικό αέρα'),
        ('internal', 'Εσωτερική'),
        ('external', 'Εξωτερική'),
        ('intermediate', 'Ενδιάμεση'),
    ]
    
    MATERIAL_TYPE_CHOICES = [
        ('old', 'Παλιά Υλικά'),
        ('new', 'Νέα Υλικά'),
    ]

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thermal_insulation = models.ForeignKey(
        ExternalWallThermalInsulation,
        on_delete=models.CASCADE,
        related_name='material_layers',
        verbose_name="Θερμομόνωση"
    )
    material = models.ForeignKey(
        'materials.Material',
        on_delete=models.CASCADE,
        verbose_name="Υλικό"
    )
    material_type = models.CharField(
        max_length=10,
        choices=MATERIAL_TYPE_CHOICES,
        verbose_name="Τύπος Υλικού",
        default='new',
        help_text="Διάκριση μεταξύ παλιών και νέων υλικών"
    )
    surface_type = models.CharField(
        max_length=30,
        choices=SURFACE_TYPE_CHOICES,
        verbose_name="Τύπος επιφάνειας",
        default='external_walls_outdoor'
    )
    thickness = models.FloatField(
        verbose_name="Πάχος (m)",
        help_text="Πάχος του υλικού σε μέτρα"
    )    
    surface_area = models.FloatField(
        verbose_name="Επιφάνεια (m²)",
        help_text="Επιφάνεια του υλικού σε τετραγωνικά μέτρα"
    )
    cost = models.FloatField(
        verbose_name="Κόστος (€)",
        null=True, blank=True,
        help_text="Κόστος του υλικού σε ευρώ (μόνο για νέα υλικά)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")

    class Meta:
        verbose_name = "Στρώση Υλικού Θερμομόνωσης"
        verbose_name_plural = "Στρώσεις Υλικών Θερμομόνωσης"
        ordering = ['thermal_insulation', 'created_at']

    def __str__(self):
        return f"{self.material.name} - {self.thickness}m - {self.get_material_type_display()}"

    @property
    def thermal_resistance(self):
        """Calculate thermal resistance R = d / λ"""
        if self.material.thermal_conductivity > 0:
            return self.thickness / self.material.thermal_conductivity
        return 0

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Trigger recalculation of U coefficient in parent
        if self.thermal_insulation:
            self.thermal_insulation.save()
