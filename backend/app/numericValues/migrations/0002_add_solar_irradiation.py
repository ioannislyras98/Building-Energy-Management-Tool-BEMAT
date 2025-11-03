# Generated migration to add solar irradiation numeric value

from django.db import migrations


def add_solar_irradiation(apps, schema_editor):
    """
    Προσθήκη της τιμής ηλιακής ακτινοβολίας στη βάση δεδομένων
    """
    NumericValue = apps.get_model('numericValues', 'NumericValue')
    User = apps.get_model('user', 'User')
    
    # Εύρεση admin user
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.filter(is_staff=True).first()
    if not admin_user:
        admin_user = User.objects.first()
    
    if admin_user:
        # Δημιουργία ή ενημέρωση της τιμής ηλιακής ακτινοβολίας
        NumericValue.objects.get_or_create(
            name='Ηλιακή ακτινοβολία (kWh/m²/έτος)',
            defaults={
                'value': 1600.0,
                'created_by': admin_user
            }
        )


def remove_solar_irradiation(apps, schema_editor):
    """
    Αφαίρεση της τιμής ηλιακής ακτινοβολίας (για rollback)
    """
    NumericValue = apps.get_model('numericValues', 'NumericValue')
    NumericValue.objects.filter(name='Ηλιακή ακτινοβολία (kWh/m²/έτος)').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('numericValues', '0001_initial'),
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_solar_irradiation, remove_solar_irradiation),
    ]
