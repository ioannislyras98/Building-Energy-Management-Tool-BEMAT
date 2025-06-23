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
        if not all([self.annual_benefit, self.annual_operating_costs, 
                   self.discount_rate, self.time_period_years, self.total_cost]):
            return 0
        
        npv = -self.total_cost  # Initial investment (negative)
        annual_net_benefit = self.annual_benefit - self.annual_operating_costs
        discount_rate_decimal = self.discount_rate / 100
        
        for year in range(1, self.time_period_years + 1):
            npv += annual_net_benefit / ((1 + discount_rate_decimal) ** year)
        
        return npv

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate U coefficient and NPV after saving
        self.u_coefficient = self.calculate_u_coefficient()
        self.net_present_value = self.calculate_npv()
        if self.pk:  # Only update if object exists (avoid recursion)
            ExternalWallThermalInsulation.objects.filter(pk=self.pk).update(
                u_coefficient=self.u_coefficient,
                net_present_value=self.net_present_value
            )


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
        help_text="Κόστος του υλικού σε ευρώ"
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
