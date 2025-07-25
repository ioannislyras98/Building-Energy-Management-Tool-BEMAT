# Generated by Django 5.1.6 on 2025-06-29 04:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thermalInsulation', '0002_externalwallthermalinsulation_annual_benefit_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thermalinsulationmateriallayer',
            name='cost',
            field=models.FloatField(blank=True, help_text='Κόστος του υλικού σε ευρώ (μόνο για νέα υλικά)', null=True, verbose_name='Κόστος (€)'),
        ),
    ]
