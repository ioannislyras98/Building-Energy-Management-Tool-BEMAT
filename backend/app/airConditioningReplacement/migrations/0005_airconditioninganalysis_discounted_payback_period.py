# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('airConditioningReplacement', '0004_remove_airconditioninganalysis_annual_cost_savings_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='airconditioninganalysis',
            name='discounted_payback_period',
            field=models.FloatField(default=0, help_text='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
