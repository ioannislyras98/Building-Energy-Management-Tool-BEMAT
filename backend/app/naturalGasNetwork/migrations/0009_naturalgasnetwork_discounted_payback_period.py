# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('naturalGasNetwork', '0008_remove_naturalgasnetwork_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='naturalgasnetwork',
            name='discounted_payback_period',
            field=models.FloatField(default=0.0, help_text='Discounted payback period (years)'),
        ),
    ]
