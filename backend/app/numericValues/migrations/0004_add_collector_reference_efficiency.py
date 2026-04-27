from django.db import migrations


def add_collector_reference_efficiency(apps, schema_editor):
    """
    Προσθήκη της απόδοσης αναφοράς συλλέκτη στις αριθμητικές τιμές.
    """
    NumericValue = apps.get_model('numericValues', 'NumericValue')
    User = apps.get_model('user', 'User')

    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.filter(is_staff=True).first()
    if not admin_user:
        admin_user = User.objects.first()

    if admin_user:
        NumericValue.objects.get_or_create(
            name='Απόδοση αναφοράς συλλέκτη (%)',
            defaults={
                'value': 21.0,
                'created_by': admin_user,
            },
        )


def remove_collector_reference_efficiency(apps, schema_editor):
    """
    Rollback: Αφαίρεση της απόδοσης αναφοράς συλλέκτη.
    """
    NumericValue = apps.get_model('numericValues', 'NumericValue')
    NumericValue.objects.filter(name='Απόδοση αναφοράς συλλέκτη (%)').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('numericValues', '0003_add_performance_ratio'),
    ]

    operations = [
        migrations.RunPython(
            add_collector_reference_efficiency,
            remove_collector_reference_efficiency,
        ),
    ]
