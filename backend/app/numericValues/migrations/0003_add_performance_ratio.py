from django.db import migrations

def add_performance_ratio(apps, schema_editor):
    """
    Προσθήκη του Performance Ratio στις αριθμητικές τιμές
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
            name='Performance Ratio (PR)',
            defaults={
                'value': 0.80,
                'created_by': admin_user
            }
        )

def remove_performance_ratio(apps, schema_editor):
    """
    Rollback: Αφαίρεση του Performance Ratio
    """
    NumericValue = apps.get_model('numericValues', 'NumericValue')
    NumericValue.objects.filter(name='Performance Ratio (PR)').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('numericValues', '0002_add_solar_irradiation'),
    ]

    operations = [
        migrations.RunPython(add_performance_ratio, remove_performance_ratio),
    ]
