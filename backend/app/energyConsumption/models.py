from django.db import models
import uuid
from django.conf import settings
from decimal import Decimal

class EnergyConsumption(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    project = models.ForeignKey(
        "project.Project",
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    building = models.ForeignKey(
        "building.Building",
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    ENERGY_SOURCES = [
        ('biomass', 'Βιομάζα'),
        ('electricity', 'Ηλεκτρική Ενέργεια'),
        ('heating_oil', 'Πετρέλαιο Θέρμανσης'),
        ('natural_gas', 'Φυσικό Αέριο'),
    ]
    
    ENERGY_UNITS = {
        'biomass': 'kg',
        'electricity': 'kWh',
        'heating_oil': 'lt',
        'natural_gas': 'm³',
    }
    
    ENERGY_KWH_CONVERSIONS = {
        'biomass': Decimal('4.1'),
        'electricity': Decimal('1.0'),
        'heating_oil': Decimal('10.0'),
        'natural_gas': Decimal('10.0'),
    }
    
    energy_source = models.CharField(
        max_length=20,
        choices=ENERGY_SOURCES,
    )
    start_date = models.DateField(verbose_name="Από")
    end_date = models.DateField(verbose_name="Έως")
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    unit = models.CharField(
        max_length=10, 
        editable=False,
        verbose_name="Μονάδα Μέτρησης"
    )
    kwh_equivalent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        verbose_name="Ισοδύναμο kWh"
    )
    
    def save(self, *args, **kwargs):
        self.unit = self.ENERGY_UNITS.get(self.energy_source, '')
        
        conversion_factor = self.ENERGY_KWH_CONVERSIONS.get(self.energy_source, Decimal('0'))
        self.kwh_equivalent = self.quantity * conversion_factor
        
        super().save(*args, **kwargs)