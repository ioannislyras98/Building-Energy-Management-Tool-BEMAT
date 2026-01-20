from django.db import models
from django.conf import settings
import uuid
from building.models import Building
from project.models import Project
from materials.models import Material
from numericValues.models import NumericValue


class RoofThermalInsulation(models.Model):
    """
    Model for roof thermal insulation calculations and data
    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='roof_thermal_insulations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='roof_thermal_insulations')
    
    u_coefficient = models.FloatField(
        verbose_name="Συντελεστής Θερμοπερατότητας U (W/m²K)", 
        default=0.0,
        help_text="Υπολογιζόμενος συντελεστής θερμοπερατότητας για την οροφή"
    )
    
    winter_hourly_losses = models.FloatField(
        verbose_name="Χειμερινές Ωριαίες Απώλειες (kW)", 
        null=True, blank=True,
        help_text="Ωριαίες απώλειες κατά τους χειμερινούς μήνες"
    )
    summer_hourly_losses = models.FloatField(
        verbose_name="Καλοκαιρινές Ωριαίες Απώλειες (kW)", 
        null=True, blank=True,
        help_text="Ωριαίες απώλειες κατά τους θερινούς μήνες"
    )
    heating_hours_per_year = models.IntegerField(
        verbose_name="Ώρες Θέρμανσης/Έτος", 
        null=True, blank=True,
        help_text="Συνολικές ώρες θέρμανσης ανά έτος"
    )
    cooling_hours_per_year = models.IntegerField(
        verbose_name="Ώρες Ψύξης/Έτος", 
        null=True, blank=True,
        help_text="Συνολικές ώρες ψύξης ανά έτος"
    )
    
    total_cost = models.FloatField(
        verbose_name="Συνολικό Κόστος (€)", 
        null=True, blank=True,
        help_text="Συνολικό κόστος υλικών και εργασίας"
    )
    annual_benefit = models.FloatField(
        verbose_name="Ετήσιο Όφελος (€)", 
        null=True, blank=True,
        help_text="Ετήσια εξοικονόμηση ενέργειας σε ευρώ"
    )
    time_period_years = models.IntegerField(
        verbose_name="Περίοδος Ανάλυσης (έτη)", 
        default=20,
        help_text="Χρονικό διάστημα για την οικονομική ανάλυση"
    )
    annual_operating_costs = models.FloatField(
        verbose_name="Ετήσια Λειτουργικά Κόστη (€)", 
        null=True, blank=True,
        help_text="Ετήσια κόστη συντήρησης και λειτουργίας"
    )
    discount_rate = models.FloatField(
        verbose_name="Επιτόκιο αναγωγής (%)", 
        default=5.0,
        help_text="Επιτόκιο για τον υπολογισμό της παρούσας αξίας"
    )
    net_present_value = models.FloatField(
        verbose_name="Καθαρή Παρούσα Αξία (€)", 
        null=True, blank=True,
        help_text="Καθαρή παρούσα αξία της επένδυσης"
    )
    payback_period = models.FloatField(
        verbose_name="Περίοδος αποπληρωμής (έτη)",
        null=True,
        blank=True,
        help_text="Περίοδος αποπληρωμής της επένδυσης σε έτη"
    )
    discounted_payback_period = models.FloatField(
        verbose_name="Προεξοφλημένη περίοδος αποπληρωμής (έτη)",
        null=True,
        blank=True,
        help_text="Προεξοφλημένη περίοδος αποπληρωμής της επένδυσης σε έτη"
    )
    internal_rate_of_return = models.FloatField(
        verbose_name="Εσωτερικός βαθμός απόδοσης (%)",
        null=True,
        blank=True,
        help_text="Εσωτερικός βαθμός απόδοσης της επένδυσης ως ποσοστό"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Δημιουργός")

    class Meta:
        verbose_name = "Θερμομόνωση Οροφής"
        verbose_name_plural = "Θερμομονώσεις Οροφής"
        ordering = ['-created_at']
        unique_together = [['building', 'created_by']]

    def __str__(self):
        return f"Θερμομόνωση Οροφής - {self.building.name} (U={self.u_coefficient:.4f})"

    def calculate_u_coefficient(self):
        """
        Calculate the U coefficient for the roof thermal insulation
        Based on the new materials layers
        """
        try:
            new_materials = self.material_layers.filter(material_type='new')
            if not new_materials.exists():
                return 0
            
            R_si = NumericValue.get_value('Εσωτερική Οροφής (Rsi)')
            R_se = NumericValue.get_value('Εξωτερική (Rse)')
            
            materials_r_sum = 0
            for material_layer in new_materials:
                try:
                    thickness = float(material_layer.thickness or 0)
                    thermal_conductivity = float(material_layer.material_thermal_conductivity or 1)
                    
                    if thermal_conductivity > 0 and thickness > 0:
                        r_material = thickness / thermal_conductivity
                        materials_r_sum += r_material
                except (AttributeError, TypeError, ValueError):
                    continue
            
            r_total = R_si + R_se + materials_r_sum
            u_coefficient = 1 / r_total if r_total > 0 else 0
            
            return round(u_coefficient, 4)
        except Exception as e:
            print(f"Error calculating U coefficient: {e}")
            return 0

    def calculate_npv(self):
        """
        Calculate Net Present Value
        Formula: NPV = -Initial_Investment + Σ(Annual_Net_Benefit / (1 + discount_rate)^year)
        """
        try:
            # Get required values with safe defaults
            initial_investment = float(self.total_cost or 0)
            annual_benefit = float(self.annual_benefit or 0)
            annual_operating_costs = float(self.annual_operating_costs or 0)
            time_period_years = int(self.time_period_years or 20)
            discount_rate_percent = float(self.discount_rate or 5.0)
            
            annual_net_benefit = annual_benefit - annual_operating_costs
            
            discount_rate_decimal = discount_rate_percent / 100.0
            
            npv = -initial_investment
            for year in range(1, time_period_years + 1):
                npv += annual_net_benefit / ((1 + discount_rate_decimal) ** year)
            return round(npv, 2) 
        except (TypeError, ValueError, ZeroDivisionError) as e:
            print(f"Error calculating NPV: {e}")
            return 0

    def calculate_annual_benefit(self):
        """
        Calculate annual benefit from energy savings
        Formula: (difference in winter hourly losses × heating hours per year + 
                  difference in summer hourly losses × cooling hours per year) × electricity cost per kWh
        """
        try:
            heating_hours = float(self.heating_hours_per_year or 0)
            cooling_hours = float(self.cooling_hours_per_year or 0)
            
            if heating_hours <= 0 and cooling_hours <= 0:
                return 0
            
            if not self.project:
                print("No project found for roof thermal insulation")
                return 0
                
            electricity_cost = 0
            if hasattr(self.project, 'cost_per_kwh_electricity') and self.project.cost_per_kwh_electricity:
                electricity_cost = float(self.project.cost_per_kwh_electricity)
                print(f"Found electricity cost: {electricity_cost}")
            else:
                print("No electricity cost found in project")
                return 0
        
            old_materials = self.material_layers.filter(material_type='old')
            new_materials = self.material_layers.filter(material_type='new')
        
            winter_losses_old = self._calculate_hourly_losses(old_materials, 17) 
            winter_losses_new = self._calculate_hourly_losses(new_materials, 17)
        
            summer_losses_old = self._calculate_hourly_losses(old_materials, 13)  
            summer_losses_new = self._calculate_hourly_losses(new_materials, 13)
        
            winter_losses_difference = winter_losses_old - winter_losses_new
            summer_losses_difference = summer_losses_old - summer_losses_new
            
            annual_energy_savings = (
                winter_losses_difference * heating_hours +
                summer_losses_difference * cooling_hours
            )
            
            annual_benefit = annual_energy_savings * electricity_cost
        
            return annual_benefit
        except Exception as e:
            print(f"Error calculating annual benefit: {e}")
            return 0

    def calculate_payback_period(self):
        """
        Calculate payback period in years
        Formula: Total Investment Cost / Annual Economic Benefit
        """
        try:
            total_cost = float(self.total_cost or 0)
            annual_benefit = float(self.annual_benefit or 0)
            
            if total_cost <= 0 or annual_benefit <= 0:
                return None
            
            payback_years = total_cost / annual_benefit
            return round(payback_years, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return None

    def calculate_discounted_payback_period(self):
        """
        Calculate discounted payback period in years
        Finds the time when cumulative discounted cash flows equal initial investment
        """
        try:
            total_cost = float(self.total_cost or 0)
            annual_benefit = float(self.annual_benefit or 0)
            annual_operating_costs = float(self.annual_operating_costs or 0)
            discount_rate = float(self.discount_rate or 5) / 100
            time_period_years = int(self.time_period_years or 20)
            
            if total_cost <= 0 or annual_benefit <= 0 or discount_rate <= 0:
                return None
            
            annual_net_benefit = annual_benefit - annual_operating_costs
            if annual_net_benefit <= 0:
                return None
            
            cumulative_discounted_cash_flow = 0
            
            for year in range(1, time_period_years + 1):
                discounted_cash_flow = annual_net_benefit / ((1 + discount_rate) ** year)
                cumulative_discounted_cash_flow += discounted_cash_flow
                
                if cumulative_discounted_cash_flow >= total_cost:
                    # Linear interpolation for precise payback period
                    previous = cumulative_discounted_cash_flow - discounted_cash_flow
                    fraction = (total_cost - previous) / discounted_cash_flow
                    return round((year - 1) + fraction, 2)
            
            # If payback not achieved within time period
            return time_period_years + 1
        except (TypeError, ValueError, ZeroDivisionError):
            return None

    def calculate_internal_rate_of_return(self):
        """
        Calculate internal rate of return using Newton-Raphson method
        IRR is the discount rate where NPV = 0
        """
        try:
            total_cost = float(self.total_cost or 0)
            annual_benefit = float(self.annual_benefit or 0)
            annual_operating_costs = float(self.annual_operating_costs or 0)
            time_period_years = int(self.time_period_years or 20)
            
            if total_cost <= 0 or annual_benefit <= 0:
                return None
            
            annual_net_benefit = annual_benefit - annual_operating_costs
            
            if annual_net_benefit <= 0:
                return None
            
            # Αρχική εκτίμηση IRR
            irr = 0.1  # 10%
            tolerance = 0.00001
            max_iterations = 1000
            
            for _ in range(max_iterations):
                # Υπολογισμός NPV με το τρέχον IRR
                npv = -total_cost
                npv_derivative = 0
                
                for year in range(1, time_period_years + 1):
                    factor = (1 + irr) ** year
                    npv += annual_net_benefit / factor
                    npv_derivative -= year * annual_net_benefit / (factor * (1 + irr))
                
                # Έλεγχος σύγκλισης
                if abs(npv) < tolerance:
                    break
                
                # Newton-Raphson update
                if npv_derivative != 0:
                    irr = irr - npv / npv_derivative
                else:
                    break
                
                # Αποφυγή αρνητικών IRR
                if irr < -0.99:
                    irr = -0.99
            
            return round(irr * 100, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return None

    def _calculate_hourly_losses(self, materials, temperature_difference):
        """
        Helper method to calculate hourly losses for a set of materials
        Formula: U × A × ΔT / 1000 (kW)
        """
        if not materials.exists():
            return 0
        
        R_si = 0.10
        R_se = 0.04 
        
        materials_r_sum = 0
        total_area = 0
        
        for material_layer in materials:
            try:
                thickness = float(material_layer.thickness or 0)
                thermal_conductivity = float(material_layer.material_thermal_conductivity or 1)
                surface_area = float(material_layer.surface_area or 0)
                
                if thermal_conductivity > 0 and thickness > 0:
                    r_material = thickness / thermal_conductivity
                    materials_r_sum += r_material
                
                total_area += surface_area
            except (AttributeError, TypeError, ValueError):
                continue
        
        r_total = R_si + R_se + materials_r_sum
        u_coefficient = 1 / r_total if r_total > 0 else 0
        
        hourly_losses = (u_coefficient * total_area * temperature_difference) / 1000
        return hourly_losses

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            self.u_coefficient = self.calculate_u_coefficient()
            self.annual_benefit = self.calculate_annual_benefit()
            self.net_present_value = self.calculate_npv()
            self.payback_period = self.calculate_payback_period()
            self.discounted_payback_period = self.calculate_discounted_payback_period()
            self.internal_rate_of_return = self.calculate_internal_rate_of_return()
            
            RoofThermalInsulation.objects.filter(uuid=self.uuid).update(
                u_coefficient=self.u_coefficient,
                annual_benefit=self.annual_benefit,
                net_present_value=self.net_present_value,
                payback_period=self.payback_period,
                discounted_payback_period=self.discounted_payback_period,
                internal_rate_of_return=self.internal_rate_of_return
            )
        except Exception as e:
            print(f"Error in auto-calculation during save: {e}")


class RoofThermalInsulationMaterialLayer(models.Model):
    """
    Model for individual material layers in roof thermal insulation
    """
    MATERIAL_TYPE_CHOICES = [
        ('old', 'Υπάρχον Υλικό'),
        ('new', 'Νέο Υλικό'),
    ]
    
    SURFACE_TYPE_CHOICES = [
        ('external_horizontal_roof', 'Εξωτερική οριζόντια ή κεκλιμένη επιφάνεια σε επαφή με τον εξωτερικό αέρα (οροφές)'),
        ('external_vertical', 'Εξωτερική κατακόρυφη επιφάνεια σε επαφή με τον εξωτερικό αέρα'),
        ('internal_horizontal', 'Εσωτερική οριζόντια επιφάνεια'),
        ('internal_vertical', 'Εσωτερική κατακόρυφη επιφάνεια'),
        ('ground_contact', 'Επιφάνεια σε επαφή με το έδαφος'),
    ]

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    roof_thermal_insulation = models.ForeignKey(
        RoofThermalInsulation, 
        on_delete=models.CASCADE, 
        related_name='material_layers'
    )
    material = models.ForeignKey(
        Material, 
        on_delete=models.CASCADE,
        verbose_name="Υλικό"
    )
    material_type = models.CharField(
        max_length=10, 
        choices=MATERIAL_TYPE_CHOICES,
        verbose_name="Τύπος Υλικού",
        help_text="Καθορίζει αν είναι υπάρχον ή νέο υλικό"
    )
    surface_type = models.CharField(
        max_length=30,
        choices=SURFACE_TYPE_CHOICES,
        default='external_horizontal_roof',
        verbose_name="Τύπος Επιφάνειας",
        help_text="Τύπος επιφάνειας για τον υπολογισμό θερμικής αντίστασης"
    )
    
    # Material properties
    thickness = models.FloatField(
        verbose_name="Πάχος (m)",
        help_text="Πάχος του υλικού σε μέτρα"
    )
    surface_area = models.FloatField(
        verbose_name="Επιφάνεια (m²)",
        help_text="Επιφάνεια εφαρμογής του υλικού"
    )
    
    # Cost (only for new materials)
    cost = models.FloatField(
        verbose_name="Κόστος (€)",
        null=True, blank=True,
        help_text="Κόστος υλικού και εργασίας (μόνο για νέα υλικά)"
    )
      # Calculated fields (populated automatically)
    material_name = models.CharField(
        max_length=100, 
        verbose_name="Όνομα Υλικού",
        help_text="Αυτόματη συμπλήρωση από το επιλεγμένο υλικό",
        null=True, blank=True
    )
    material_thermal_conductivity = models.FloatField(
        verbose_name="Θερμική Αγωγιμότητα (W/mK)",
        help_text="Αυτόματη συμπλήρωση από το επιλεγμένο υλικό",
        null=True, blank=True
    )
    surface_type_display = models.CharField(
        max_length=100,
        verbose_name="Επιφάνεια (Περιγραφή)",
        help_text="Περιγραφή του τύπου επιφάνειας",
        null=True, blank=True
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Σειρά",
        help_text="Σειρά του υλικού στη στρώση (από εσωτερικά προς εξωτερικά)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")

    class Meta:
        verbose_name = "Στρώση Υλικού Θερμομόνωσης Οροφής"
        verbose_name_plural = "Στρώσεις Υλικών Θερμομόνωσης Οροφής"
        ordering = ['material_type', 'order']

    def save(self, *args, **kwargs):
        # Auto-populate fields from the selected material
        if self.material:
            self.material_name = self.material.name
            self.material_thermal_conductivity = self.material.thermal_conductivity
        
        # Auto-populate surface type display
        self.surface_type_display = dict(self.SURFACE_TYPE_CHOICES).get(self.surface_type, '')
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.material_name} - {self.thickness}m ({self.material_type})"
    
    @property
    def thermal_resistance(self):
        """Calculate thermal resistance (R = thickness / thermal_conductivity)"""
        if self.material_thermal_conductivity > 0:
            return self.thickness / self.material_thermal_conductivity
        return 0
