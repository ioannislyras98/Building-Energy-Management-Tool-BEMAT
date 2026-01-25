# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hotWaterUpgrade', '0007_remove_hotwaterupgrade_id_alter_hotwaterupgrade_uuid'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotwaterupgrade',
            name='discounted_payback_period',
            field=models.FloatField(default=0.0),
        ),
    ]
