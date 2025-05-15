from django.db import models
import uuid
from django.conf import settings
from decimal import Decimal  # Add this import

class EnergyConsumption(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to the user (using Django's AUTH_USER_MODEL)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    # Link to a Project (adjust the app label if needed, e.g. "project.Project")
    project = models.ForeignKey(
        "project.Project",
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    # Link to a Building (adjust the app label if needed, e.g. "building.Building")
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
    
    # Energy source unit mappings
    ENERGY_UNITS = {
        'biomass': 'kg',
        'electricity': 'kWh',
        'heating_oil': 'lt',
        'natural_gas': 'm³',
    }
    
    # Energy conversion rates to kWh
    ENERGY_KWH_CONVERSIONS = {
        'biomass': Decimal('4.1'),      # 1 kg = 4.1 kWh
        'electricity': Decimal('1.0'),     # 1 kWh = 1 kWh
        'heating_oil': Decimal('10.0'), # 1 lt = 10 kWh
        'natural_gas': Decimal('10.0'), # 1 m³ = 10 kWh
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
        # Set the unit based on energy source
        self.unit = self.ENERGY_UNITS.get(self.energy_source, '')
        
        # Calculate kWh equivalent
        conversion_factor = self.ENERGY_KWH_CONVERSIONS.get(self.energy_source, Decimal('0'))
        self.kwh_equivalent = self.quantity * conversion_factor
        
        super().save(*args, **kwargs)