from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()


class Prefecture(models.Model):
    """
    Reference table for Greek prefectures with energy zones and temperature data.
    This can be used across different apps for building location information.
    Only admin can manage this table.
    """
    
    ENERGY_ZONE_CHOICES = [
        ('A', 'Ζώνη Α'),
        ('B', 'Ζώνη Β'),
        ('C', 'Ζώνη Γ'),
        ('D', 'Ζώνη Δ'),
    ]

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=100, 
        verbose_name="Όνομα Νομού",
        unique=True
    )
    zone = models.CharField(
        max_length=1,
        choices=ENERGY_ZONE_CHOICES,
        verbose_name="Ενεργειακή Ζώνη",
        help_text="Ενεργειακή ζώνη σύμφωνα με τον ελληνικό κανονισμό"
    )
    temperature_winter = models.FloatField(
        verbose_name="Θερμοκρασία Χειμώνα (°C)",
        help_text="Μέση θερμοκρασία χειμώνα σε βαθμούς Κελσίου",
        null=True,
        blank=True
    )
    temperature_summer = models.FloatField(
        verbose_name="Θερμοκρασία Καλοκαιριού (°C)",
        help_text="Μέση θερμοκρασία καλοκαιριού σε βαθμούς Κελσίου",
        null=True,
        blank=True
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Ενεργό",
        help_text="Αν ο νομός είναι διαθέσιμος για χρήση"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Δημιουργός",
        help_text="Μόνο admin μπορεί να δημιουργήσει νομούς",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Νομός"
        verbose_name_plural = "Νομοί"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Ζώνη {self.zone})"
