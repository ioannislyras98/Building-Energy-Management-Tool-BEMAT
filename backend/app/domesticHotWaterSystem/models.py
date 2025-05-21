from django.db import models
import uuid
from django.conf import settings

class DomesticHotWaterSystem(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey('building.Building', on_delete=models.CASCADE, related_name='domestic_hot_water_systems')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='domestic_hot_water_systems')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='domestic_hot_water_systems',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    # New specific fields for domestic hot water system
    boiler_type = models.CharField(max_length=255, null=True, blank=True)
    power_kw = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    thermal_efficiency = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    distribution_network_state = models.CharField(max_length=255, null=True, blank=True)
    storage_tank_state = models.CharField(max_length=255, null=True, blank=True)
    energy_metering_system = models.CharField(max_length=255, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Domestic Hot Water System for {self.building} - {self.uuid}"
