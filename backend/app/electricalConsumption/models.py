from django.db import models
import uuid
from django.conf import settings


class ElectricalConsumption(models.Model):
    # Choices για τύπο κατανάλωσης
    CONSUMPTION_TYPE_CHOICES = [
        ('lighting', 'Φωτισμός'),
        ('air_conditioning', 'Κλιματισμός'),
        ('other_electrical_devices', 'Άλλες ηλεκτρικές συσκευές'),
    ]
    
    # Choices για τύπο φορτίου
    LOAD_TYPE_CHOICES = [
        ('continuous', 'Συνεχής'),
        ('intermittent', 'Διαλείπων'),
        ('peak', 'Αιχμής'),
        ('base', 'Βάσης'),
    ]

    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey(
        'building.Building', 
        on_delete=models.CASCADE, 
        related_name='electrical_consumptions'
    )
    project = models.ForeignKey(
        'project.Project', 
        on_delete=models.CASCADE, 
        related_name='electrical_consumptions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='electrical_consumptions',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    
    # Specific fields for electrical consumption
    consumption_type = models.CharField(
        max_length=50,
        choices=CONSUMPTION_TYPE_CHOICES,
        verbose_name='Τύπος κατανάλωσης'
    )
    thermal_zone = models.ForeignKey(
        'thermalZone.ThermalZone',
        on_delete=models.CASCADE,
        related_name='electrical_consumptions',
        verbose_name='Θερμική ζώνη'
    )
    period = models.CharField(
        max_length=255,        blank=True,
        null=True,
        verbose_name='Περίοδος'
    )
    energy_consumption = models.ForeignKey(
        'energyConsumption.EnergyConsumption',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='electrical_consumptions',
        verbose_name='Αναφορά Ενεργειακής Κατανάλωσης'
    )
    load_type = models.CharField(
        max_length=50,
        choices=LOAD_TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='Τύπος φορτίου'
    )
    load_power = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Ισχύς φορτίου (kW)'
    )
    quantity = models.IntegerField(
        blank=True,
        null=True,
        verbose_name='Πλήθος'
    )
    operating_hours_per_year = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Ώρες λειτουργίας ανά έτος'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Ημερομηνία δημιουργίας'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Ημερομηνία τελευταίας ενημέρωσης'
    )

    class Meta:
        verbose_name = 'Ηλεκτρική Κατανάλωση'
        verbose_name_plural = 'Ηλεκτρικές Καταναλώσεις'
        ordering = ['-created_at']

    def __str__(self):
        return f"Electrical Consumption - {self.get_consumption_type_display()} for {self.building}"
    
    @property
    def annual_energy_consumption(self):
        """Calculate annual energy consumption in kWh"""
        try:
            if self.load_power and self.quantity and self.operating_hours_per_year:
                load_power = float(self.load_power) if self.load_power else 0
                quantity = int(self.quantity) if self.quantity else 0
                hours = float(self.operating_hours_per_year) if self.operating_hours_per_year else 0
                return load_power * quantity * hours
            return 0
        except (ValueError, TypeError):
            return 0
