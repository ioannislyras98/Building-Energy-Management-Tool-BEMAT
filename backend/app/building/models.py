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
        to_field='uuid'  # Add this to specify the target field on the User model
    )
    # Βασικές πληροφορίες
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
        blank=False,  # Changed from blank=True to make it required
        verbose_name='Περιγραφή'
    )
    year_built = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Έτος Κατασκευής'
    )
    address = models.CharField(
        max_length=200,
        blank=False,  # Changed from blank=True to make it required
        verbose_name='Διεύθυνση'
    )
    
    prefecture = models.CharField(
        max_length=100,
        blank=False,
        verbose_name='Νομός',
    )
    
    energy_zone = models.CharField(
        max_length=1,
        blank=False,
        verbose_name='Ενεργειακή Ζώνη',
    )
    
    # Λογικές τιμές
    is_insulated = models.BooleanField(
        default=False,
        verbose_name='Μονωμένο'
    )
    is_certified = models.BooleanField(
        default=False,
        verbose_name='Πιστοποιημένο'
    )
    
    # Στοιχεία επιφάνειας
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
    
    # New fields
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
    
    # # Μετρήσεις / Συνθήκες - keeping these for backward compatibility
    # room_temperature = models.DecimalField(
    #     max_digits=5,
    #     decimal_places=2,
    #     default=25,
    #     validators=[MinValueValidator(0)],
    #     verbose_name='Θερμοκρασία Χώρου (°C)'
    # )
    # no_ppm = models.DecimalField(
    #     max_digits=5,
    #     decimal_places=2,
    #     validators=[MaxValueValidator(65)],
    #     verbose_name='Μονοξείδιο του Αζώτου - NO (ppm)',
    #     help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65'
    # )
    # nox_ppm = models.DecimalField(
    #     max_digits=5,
    #     decimal_places=2,
    #     validators=[MaxValueValidator(65)],
    #     verbose_name='Οξείδια του Αζώτου - NOx (ppm)',
    #     help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65'
    # )
    # co2_ppm = models.DecimalField(
    #     max_digits=5,
    #     decimal_places=2,
    #     validators=[MaxValueValidator(125)],
    #     verbose_name='Διοξείδιο του Άνθρακα (ppm)',
    #     help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 125'
    # )
    # smoke_scale = models.PositiveIntegerField(
    #     validators=[MaxValueValidator(9)],
    #     verbose_name='Κάπνός (Brigon smoke scale 0-9)',
    #     help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 9'
    # )
    # exhaust_temperature = models.DecimalField(
    #     max_digits=5,
    #     decimal_places=2,
    #     validators=[MinValueValidator(180)],
    #     verbose_name='Θερμοκρασία Καυσαερίων (°C)',
    #     help_text='Βεβαιωθείτε ότι η τιμή είναι ≥ 180'
    # )
    
    # Χρονική σήμανση
    date_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Ημερομηνία Δημιουργίας'
    )
        
    def __str__(self):
        return self.name