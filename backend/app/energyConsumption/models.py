from django.db import models
import uuid
from django.conf import settings

class energyConsumption(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to the user (using Django's AUTH_USER_MODEL)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    # Link to a Project (adjust the app label if needed, e.g. "project.Project")
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    # Link to a Building (adjust the app label if needed, e.g. "building.Building")
    building = models.ForeignKey(
        "Building",
        on_delete=models.CASCADE,
        related_name="energy_profiles",
    )
    
    ENERGY_SOURCES = [
        ('biomass', 'Βιομάζα'),
        ('electric', 'Ηλεκτρική Ενέργεια'),
        ('heating_oil', 'Πετρέλαιο Θέρμανσης'),
        ('natural_gas', 'Φυσικό Αέριο'),
    ]
    
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