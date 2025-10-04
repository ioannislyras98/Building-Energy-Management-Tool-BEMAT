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
    
    # Specific fields for heating system
    heating_system_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Τύπος συστήματος θέρμανσης'
    )
    exchanger_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Τύπος εναλλάκτη'
    )
    central_boiler_system = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κεντρικό σύστημα λέβητα'
    )
    central_heat_pump_system = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κεντρικό σύστημα με αντλία θερμότητας'
    )
    local_heating_system = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Τοπικό σύστημα θέρμανσης'
    )
    power_kw = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Ισχύς (kW)'
    )
    construction_year = models.IntegerField(
        blank=True,
        null=True,
        verbose_name='Έτος κατασκευής'
    )
    cop = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Συντελεστής ενεργειακής επίδοσης (COP)'
    )
    distribution_network_state = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Κατάσταση δικτύου διανομής (περνά από μη θερμαινόμενους χώρους)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Σύστημα Θέρμανσης"
        verbose_name_plural = "Συστήματα Θέρμανσης"
        unique_together = [['building', 'user']]
    
    def __str__(self):
        return f"Heating System {self.uuid} - {self.building}"
