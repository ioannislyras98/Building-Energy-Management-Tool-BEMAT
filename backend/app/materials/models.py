from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()


class Material(models.Model):
    """
    Reference table for construction materials with thermal conductivity values.
    This can be used across different apps (thermal insulation, walls, etc.)
    Only admin can manage this table.
    """
    MATERIAL_CATEGORY_CHOICES = [
        ('wood', 'Ξυλεία'),
        ('concrete', 'Σκυρόδεμα'),
        ('insulation', 'Μονωτικά Υλικά'),
        ('metal', 'Μέταλλα'),
        ('glass', 'Γυαλί'),
        ('masonry', 'Τοιχοποιία'),
        ('plaster', 'Επιχρίσματα'),
        ('stone', 'Πετρώματα'),
        ('roof', 'Υλικά Οροφής'),
        ('flooring', 'Δάπεδα'),
        ('other', 'Άλλα'),
    ]

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Όνομα Υλικού")
    category = models.CharField(
        max_length=20,
        choices=MATERIAL_CATEGORY_CHOICES,
        verbose_name="Κατηγορία Υλικού",
        default='other'
    )
    thermal_conductivity = models.FloatField(
        verbose_name="Τυπικός συντελεστής λ (W/mK)",
        help_text="Συντελεστής θερμικής αγωγιμότητας σε W/mK"
    )
    description = models.TextField(
        verbose_name="Περιγραφή",
        blank=True,
        help_text="Επιπλέον πληροφορίες για το υλικό"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Ενεργό",
        help_text="Αν το υλικό είναι διαθέσιμο για χρήση"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Δημιουργός",
        help_text="Μόνο admin μπορεί να δημιουργήσει υλικά",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Υλικό"
        verbose_name_plural = "Υλικά"
        ordering = ['category', 'name']
        unique_together = ['name', 'category']

    def __str__(self):
        return f"{self.name} (λ = {self.thermal_conductivity} W/mK)"
