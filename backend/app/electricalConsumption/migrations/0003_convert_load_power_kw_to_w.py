# Migration to convert existing load_power values from kW to W
# Multiplies all existing values by 1000

from django.db import migrations


def convert_kw_to_w(apps, schema_editor):
    """Convert existing load_power values from kW to W by multiplying by 1000"""
    ElectricalConsumption = apps.get_model('electricalConsumption', 'ElectricalConsumption')
    
    for consumption in ElectricalConsumption.objects.all():
        if consumption.load_power is not None:
            # Convert kW to W
            consumption.load_power = consumption.load_power * 1000
            consumption.save(update_fields=['load_power'])


def convert_w_to_kw(apps, schema_editor):
    """Reverse operation: convert W back to kW by dividing by 1000"""
    ElectricalConsumption = apps.get_model('electricalConsumption', 'ElectricalConsumption')
    
    for consumption in ElectricalConsumption.objects.all():
        if consumption.load_power is not None:
            # Convert W back to kW
            consumption.load_power = consumption.load_power / 1000
            consumption.save(update_fields=['load_power'])


class Migration(migrations.Migration):

    dependencies = [
        ('electricalConsumption', '0002_alter_load_power_unit'),
    ]

    operations = [
        migrations.RunPython(convert_kw_to_w, convert_w_to_kw),
    ]
