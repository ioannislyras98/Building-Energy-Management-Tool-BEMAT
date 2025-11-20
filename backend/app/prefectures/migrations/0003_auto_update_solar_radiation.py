# Generated manually

from django.db import migrations


def update_solar_radiation(apps, schema_editor):
    """Update solar radiation values for all prefectures based on their energy zone"""
    Prefecture = apps.get_model('prefectures', 'Prefecture')
    
    # Ηλιακή ακτινοβολία ανά ενεργειακή ζώνη
    solar_radiation_by_zone = {
        'A': 4.75,  # Ζώνη Α (Βόρεια Ελλάδα): 4.5-5.0
        'B': 5.25,  # Ζώνη Β (Κεντρική Ελλάδα): 5.0-5.5
        'C': 5.75,  # Ζώνη Γ (Νότια Ελλάδα, Αθήνα): 5.5-6.0
        'D': 6.25,  # Ζώνη Δ (Νησιά, Κρήτη): 6.0-6.5
    }
    
    for prefecture in Prefecture.objects.all():
        if prefecture.zone in solar_radiation_by_zone:
            prefecture.solar_radiation = solar_radiation_by_zone[prefecture.zone]
            prefecture.save()


class Migration(migrations.Migration):

    dependencies = [
        ('prefectures', '0002_prefecture_solar_radiation'),
    ]

    operations = [
        migrations.RunPython(update_solar_radiation, reverse_code=migrations.RunPython.noop),
    ]
