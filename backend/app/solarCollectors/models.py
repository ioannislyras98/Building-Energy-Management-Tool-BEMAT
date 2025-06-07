from django.db import models
import uuid
from django.conf import settings

class SolarCollector(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey('building.Building', on_delete=models.CASCADE, related_name='solar_collectors')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='solar_collectors')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='solar_collectors',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    
    # Specific fields for solar collectors
    solar_collector_usage = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Χρήση ηλιακών συλλεκτών'
    )
    solar_collector_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Τύπος ηλιακού συλλέκτη'
    )
    collector_surface_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Επιφάνεια ηλιακών συλλεκτών (m²)'
    )
    hot_water_storage_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Χωρητικότητα δοχείου αποθήκευσης για Ζ.Ν.Χ. (L)'
    )
    heating_storage_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Χωρητικότητα δοχείου αποθήκευσης για τη θέρμανση χώρων (L)'
    )
    distribution_network_state = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κατάσταση δικτύου διανομής (που περνά από μη θερμαινόμενους χώρους)'
    )
    terminal_units_position = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Θέση τερματικών μονάδων'
    )
    collector_accessibility = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Δυνατότητα πρόσβασης στους ηλιακούς συλλέκτες'
    )
    storage_tank_condition = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κατάσταση δοχείου αποθήκευσης'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Solar Collector for {self.building} - {self.uuid}"
