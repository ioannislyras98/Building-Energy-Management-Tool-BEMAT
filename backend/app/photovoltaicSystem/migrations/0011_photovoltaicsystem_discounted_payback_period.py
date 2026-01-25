# Generated migration to add discounted_payback_period field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('photovoltaicSystem', '0010_alter_photovoltaicsystem_collector_efficiency_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='photovoltaicsystem',
            name='discounted_payback_period',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Προεξοφλημένη περίοδος αποπληρωμής της επένδυσης σε έτη', max_digits=8, null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
