# Generated by Django 5.1.6 on 2025-06-07 17:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('domesticHotWaterSystem', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='domestichotwatersystem',
            name='heating_system_type',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Τύπος Συστήματος Θέρμανσης'),
        ),
    ]
