from django.db import models
from django.conf import settings
import uuid
from building.models import Building
from project.models import Project
from materials.models import Material


class RoofThermalInsulation(models.Model):
    """
    Model for roof thermal insulation calculations and data
    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='roof_thermal_insulations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='roof_thermal_insulations')
    
    # Thermal calculations
    u_coefficient = models.FloatField(
        verbose_name="Συντελεστής Θερμοπερατότητας U (W/m²K)", 
        default=0.0,
        help_text="Υπολογιζόμενος συντελεστής θερμοπερατότητας για την οροφή"
    )
    
    # Heating and cooling losses
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
    
    # Economic analysis
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
        verbose_name="Επιτόκιο Προεξόφλησης (%)", 
        default=5.0,
        help_text="Επιτόκιο για τον υπολογισμό της παρούσας αξίας"
    )
    net_present_value = models.FloatField(
        verbose_name="Καθαρή Παρούσα Αξία (€)", 
        null=True, blank=True,
        help_text="Καθαρή παρούσα αξία της επένδυσης"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Δημιουργός")

    class Meta:
        verbose_name = "Θερμομόνωση Οροφής"
        verbose_name_plural = "Θερμομονώσεις Οροφής"
        ordering = ['-created_at']

    def __str__(self):
        return f"Θερμομόνωση Οροφής - {self.building.name} (U={self.u_coefficient:.4f})"


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
        help_text="Αυτόματη συμπλήρωση από το επιλεγμένο υλικό"
    )
    material_thermal_conductivity = models.FloatField(
        verbose_name="Θερμική Αγωγιμότητα (W/mK)",
        help_text="Αυτόματη συμπλήρωση από το επιλεγμένο υλικό"
    )
    surface_type_display = models.CharField(
        max_length=100,
        verbose_name="Επιφάνεια (Περιγραφή)",
        help_text="Περιγραφή του τύπου επιφάνειας"
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
