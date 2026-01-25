# Generated migration to add discounted_payback_period field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thermalInsulation', '0005_alter_externalwallthermalinsulation_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='externalwallthermalinsulation',
            name='discounted_payback_period',
            field=models.FloatField(blank=True, help_text='Προεξοφλημένη περίοδος αποπληρωμής της επένδυσης σε έτη', null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
