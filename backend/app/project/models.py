from django.db import models
from django.utils import timezone
import uuid

class Project(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=100)
    date_created = models.DateField(default=timezone.now)
    buildings_count = models.PositiveIntegerField(default=0)
    cost_per_kwh_fuel = models.DecimalField(
        max_digits=6, 
        decimal_places=3,
        verbose_name="Κόστος ανά kWh καυσίμου (€)"
    )
    cost_per_kwh_electricity = models.DecimalField(
        max_digits=6, 
        decimal_places=3,
        verbose_name="Κόστος ανά kWh ρεύματος (€)"
    )
    # Κάθε έργο ανήκει σε έναν χρήστη
    user = models.ForeignKey(
        'user.User', 
        on_delete=models.CASCADE,
        related_name="projects"
    )

    class Meta:
        unique_together = (("user", "name"),)

    def __str__(self):
        return self.name