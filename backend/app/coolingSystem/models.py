import uuid
from django.db import models
from django.conf import settings

# Create your models here.
class CoolingSystem(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey('building.Building', on_delete=models.CASCADE, related_name='cooling_systems')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='cooling_systems')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cooling_systems',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    cooling_system_type = models.CharField(
        max_length=255, 
        verbose_name="Τύπος Συστήματος Ψύξης",
        null=True,
        blank=True,
        help_text="Εισάγετε τον τύπο του συστήματος ψύξης"
    )
    cooling_unit_accessibility = models.CharField(
        max_length=255,
        verbose_name="Δυνατότητα Πρόσβασης στη Μονάδα Ψύξης",
        null=True,
        blank=True,
        help_text="Εισάγετε τη δυνατότητα πρόσβασης στη μονάδα ψύξης"
    )
    heat_pump_type = models.CharField(max_length=255, verbose_name="Heat Pump Type", null=True, blank=True)
    power_kw = models.FloatField(verbose_name="Power (kW)", null=True, blank=True)
    construction_year = models.IntegerField(verbose_name="Year of Construction", null=True, blank=True)
    energy_efficiency_ratio = models.FloatField(verbose_name="Energy Efficiency Ratio (EER)", null=True, blank=True)
    maintenance_period = models.CharField(max_length=255, verbose_name="Maintenance Period", null=True, blank=True)
    operating_hours = models.CharField(max_length=255, verbose_name="Operating Hours", null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        system_type = self.cooling_system_type if self.cooling_system_type else "Unknown Type"
        return f"Cooling System for {self.building.name} - {system_type}"
