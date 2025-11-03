# Generated migration to update load_power unit from kW to W

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('electricalConsumption', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='electricalconsumption',
            name='load_power',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Ισχύς φορτίου (W)'),
        ),
    ]
