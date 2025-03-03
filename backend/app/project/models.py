from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=100)
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

    def __str__(self):
        return self.name
    