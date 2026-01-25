# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('automaticLightingControl', '0008_alter_automaticlightingcontrol_discount_rate_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='automaticlightingcontrol',
            name='discounted_payback_period',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Αυτόματος υπολογισμός προεξοφλημένης περιόδου αποπληρωμής', max_digits=8, null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
