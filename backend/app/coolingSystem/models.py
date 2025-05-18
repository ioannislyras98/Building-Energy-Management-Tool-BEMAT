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
    heat_pump_type = models.CharField(max_length=255, verbose_name="Heat Pump Type")
    power_kw = models.FloatField(verbose_name="Power (kW)")
    construction_year = models.IntegerField(verbose_name="Year of Construction")
    energy_efficiency_ratio = models.FloatField(verbose_name="Energy Efficiency Ratio (EER)")
    maintenance_period = models.CharField(max_length=255, verbose_name="Maintenance Period")
    operating_hours = models.CharField(max_length=255, verbose_name="Operating Hours")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cooling System for {self.building.name} - {self.heat_pump_type}"
