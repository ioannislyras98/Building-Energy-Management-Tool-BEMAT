import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Building(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='buildings')
    user = models.ForeignKey(
        'user.User', 
        on_delete=models.CASCADE,
        related_name="buildings",
        to_field='uuid'
    )
    name = models.CharField(
        max_length=100, 
        verbose_name='Σύνολο Κτιρίου'
    )
    usage = models.CharField(
        max_length=100,
        verbose_name='Χρήση Κτιρίου',
        help_text='π.χ. Νοσοκομείο, Κλινικές'
    )
    description = models.TextField(
        blank=False,  
        verbose_name='Περιγραφή'
    )
    year_built = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Έτος Κατασκευής'
    )
    address = models.CharField(
        max_length=200,
        blank=False, 
        verbose_name='Διεύθυνση'
    )
    
    prefecture = models.ForeignKey(
        'prefectures.Prefecture',
        on_delete=models.CASCADE,
        verbose_name='Νομός',
        related_name='buildings'
    )
    
    energy_zone = models.CharField(
        max_length=1,
        blank=False,
        verbose_name='Ενεργειακή Ζώνη',
        editable=False 
    )
    
    is_insulated = models.BooleanField(
        default=False,
        verbose_name='Μονωμένο'
    )
    is_certified = models.BooleanField(
        default=False,
        verbose_name='Πιστοποιημένο'
    )
    
    energy_class = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Ενεργειακή Κλάση'
    )
    orientation = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Προσανατολισμός',
        help_text='π.χ. Βόρειος, Νότιος, Ανατολικός, Δυτικός'
    )
    total_area = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Συνολική Επιφάνεια (m²)'
    )
    examined_area = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Εξεταζόμενη Επιφάνεια (m²)'
    )
    floors_examined = models.PositiveIntegerField(
        default=1,
        verbose_name='Αριθμός Εξεταζόμενων Ορόφων'
    )
    
    floor_height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='Ύψος Ορόφου (m)'
    )
    
    construction_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Τύπος Κατασκευής',
        help_text='Μέθοδος/υλικά κατασκευής'
    )
    
    free_facades = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(4)],
        verbose_name='Ελεύθερες Όψεις',
        help_text='Αριθμός εκτεθειμένων εξωτερικών τοίχων (0-4)'
    )
    
    altitude = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='Υψόμετρο (m)',
        help_text='Υψόμετρο κτιρίου από τη στάθμη της θάλασσας'
    )
    
    non_operating_days = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Ημέρες Μη Λειτουργίας',
        help_text='π.χ. Σαββατοκύριακα, Αργίες'
    )
    
    operating_hours = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Ωράριο Λειτουργίας',
        help_text='π.χ. 9:00-17:00'
    )
    
    occupants = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Αριθμός Ατόμων',
        help_text='Μέσος αριθμός ατόμων στο κτίριο'
    )
    
    date_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Ημερομηνία Δημιουργίας'
    )
    
    def save(self, *args, **kwargs):
        if self.prefecture:
            self.energy_zone = self.prefecture.zone
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.name