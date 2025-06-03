from django.db import models
import uuid
from django.conf import settings

class HeatingSystem(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='heating_systems',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    building = models.ForeignKey('building.Building', on_delete=models.CASCADE, related_name='heating_systems')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='heating_systems')
    
    # New fields for heating system
    exchanger_type = models.CharField(max_length=100, blank=True, null=True)
    power_kw = models.FloatField(blank=True, null=True)
    construction_year = models.IntegerField(blank=True, null=True)
    cop = models.FloatField(blank=True, null=True)
    distribution_network_state = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Heating System {self.uuid} - {self.building}"
