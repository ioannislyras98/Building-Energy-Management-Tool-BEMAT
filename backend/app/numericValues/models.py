from django.db import models
from django.conf import settings
import uuid


class NumericValue(models.Model):
    """
    Model για τη διαχείριση αριθμητικών τιμών (όπως θερμικές αντιστάσεις επιφάνειας)
    Απλή δομή όπως τους νομούς για εύκολη διαχείριση από το admin
    """

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    name = models.CharField(
        max_length=200,
        unique=True,
        verbose_name="Όνομα",
        help_text="Μοναδικό όνομα για την αριθμητική τιμή"
    )
    
    value = models.FloatField(
        verbose_name="Τιμή",
        help_text="Αριθμητική τιμή"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Δημιουργός"
    )

    class Meta:
        verbose_name = "Αριθμητική Τιμή"
        verbose_name_plural = "Αριθμητικές Τιμές"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.value}"

    @classmethod
    def get_value(cls, name):
        """
        Helper method για την ανάκτηση τιμής βάσει ονόματος
        """
        try:
            numeric_value = cls.objects.get(name=name)
            return numeric_value.value
        except cls.DoesNotExist:
            defaults = {
                'Εσωτερική Οροφής (Rsi)': 0.10,
                'Εσωτερική Τοίχου (Rsi)': 0.13,
                'Εξωτερική (Rse)': 0.04,
            }
            return defaults.get(name, 0.0)

    @classmethod
    def get_roof_resistances(cls):
        """
        Επιστρέφει τις αντιστάσεις για οροφή (R_si, R_se)
        """
        R_si = cls.get_value('Εσωτερική (Rsi)')
        R_se = cls.get_value('Εξωτερική (Rse)')
        return R_si, R_se


def create_default_numeric_values():
    """
    Δημιουργεί τις προεπιλεγμένες αριθμητικές τιμές
    Καλείται κατά την εκτέλεση migration
    """
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.first()
            
        if not admin_user:
            print("No user found to assign as creator of numeric values")
            return
    except Exception as e:
        print(f"Error finding user: {e}")
        return

    default_values = [
        {
            'name': 'Εσωτερική Οροφής (Rsi)',
            'value': 0.10,
            'created_by': admin_user
        },
        {
            'name': 'Εσωτερική Τοίχου (Rsi)',
            'value': 0.13,
            'created_by': admin_user
        },
        {
            'name': 'Εξωτερική (Rse)',
            'value': 0.04,
            'created_by': admin_user
        },
    ]

    for value_data in default_values:
        NumericValue.objects.get_or_create(
            name=value_data['name'],
            defaults=value_data
        )
    
    print(f"Created/updated {len(default_values)} numeric value entries")