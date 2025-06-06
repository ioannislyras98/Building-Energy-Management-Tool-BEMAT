# Generated by Django 5.1.6 on 2025-06-07 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heatingSystem', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='heatingsystem',
            name='central_boiler_system',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Κεντρικό σύστημα λέβητα'),
        ),
        migrations.AddField(
            model_name='heatingsystem',
            name='central_heat_pump_system',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Κεντρικό σύστημα με αντλία θερμότητας'),
        ),
        migrations.AddField(
            model_name='heatingsystem',
            name='heating_system_type',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Τύπος συστήματος θέρμανσης'),
        ),
        migrations.AddField(
            model_name='heatingsystem',
            name='local_heating_system',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Τοπικό σύστημα θέρμανσης'),
        ),
        migrations.AlterField(
            model_name='heatingsystem',
            name='construction_year',
            field=models.IntegerField(blank=True, null=True, verbose_name='Έτος κατασκευής'),
        ),
        migrations.AlterField(
            model_name='heatingsystem',
            name='cop',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True, verbose_name='Συντελεστής ενεργειακής επίδοσης (COP)'),
        ),
        migrations.AlterField(
            model_name='heatingsystem',
            name='distribution_network_state',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Κατάσταση δικτύου διανομής (περνά από μη θερμαινόμενους χώρους)'),
        ),
        migrations.AlterField(
            model_name='heatingsystem',
            name='exchanger_type',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Τύπος εναλλάκτη'),
        ),
        migrations.AlterField(
            model_name='heatingsystem',
            name='power_kw',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Ισχύς (kW)'),
        ),
    ]
