from django.db import models
import uuid
from django.conf import settings


class ThermalZone(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey(
        'building.Building', 
        on_delete=models.CASCADE, 
        related_name='thermal_zones'
    )
    project = models.ForeignKey(
        'project.Project', 
        on_delete=models.CASCADE, 
        related_name='thermal_zones'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='thermal_zones',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    
    thermal_zone_usage = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Χρήση θερμικής ζώνης'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Περιγραφή'
    )
    space_condition = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κατάσταση χώρου'
    )
    floor = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Όροφος'
    )
    total_thermal_zone_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Συνολική επιφάνεια θερμικής ζώνης (m²)'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Ημερομηνία δημιουργίας'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Ημερομηνία τελευταίας ενημέρωσης'
    )

    class Meta:
        verbose_name = 'Θερμική Ζώνη'
        verbose_name_plural = 'Θερμικές Ζώνες'
        ordering = ['-created_at']

    def __str__(self):
        return f"Thermal Zone for {self.building} - {self.thermal_zone_usage or 'Unnamed'}"
