from django.db import models
import uuid
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from building.models import Building
from project.models import Project

class BoilerDetail(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='boiler_details',
        to_field='uuid',
        verbose_name='Κτίριο'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='boiler_details',
        to_field='uuid',
        verbose_name='Έργο'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='boiler_details',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    
    # Βασικά στοιχεία λέβητα
    nominal_power = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='Ονομαστική Ισχύς (kW)'
    )
    internal_efficiency = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Εσωτερικός Βαθμός Απόδοσης (%)'
    )
    manufacturing_year = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Έτος Κατασκευής'
    )
    fuel_type = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name='Είδος Καυσίμου'
    )
    
    # Μετρήσεις καυσαερίων
    nitrogen_monoxide = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(65)],
        verbose_name='Μονοξείδιο του Αζώτου - NO (ppm)',
        help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65'
    )
    nitrogen_oxides = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(65)],
        verbose_name='Οξείδια του Αζώτου - NOx (ppm)',
        help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65'
    )
    exhaust_temperature = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='Θερμοκρασία Καυσαερίων (°C)'
    )
    smoke_scale = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(9)],
        verbose_name='Κάπνός (Brigon smoke scale 0-9)',
        help_text='Βεβαιωθείτε ότι η τιμή είναι μεταξύ 0-9'
    )
    room_temperature = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='Θερμοκρασία Χώρου (°C)'
    )
    
    # Χρονικές σημάνσεις
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Ημερομηνία Δημιουργίας'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Ημερομηνία Τελευταίας Ενημέρωσης'
    )

    def __str__(self):
        return f"Λεβητας για κτίριο {self.building.name if self.building else 'None'}"
