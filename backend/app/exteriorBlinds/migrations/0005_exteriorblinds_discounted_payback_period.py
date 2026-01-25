# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exteriorBlinds', '0004_alter_exteriorblinds_net_present_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='exteriorblinds',
            name='discounted_payback_period',
            field=models.FloatField(blank=True, help_text='Αυτόματος υπολογισμός προεξοφλημένης περιόδου αποπληρωμής', null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
