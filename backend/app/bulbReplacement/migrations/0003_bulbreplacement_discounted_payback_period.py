# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bulbReplacement', '0002_alter_bulbreplacement_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='bulbreplacement',
            name='discounted_payback_period',
            field=models.FloatField(blank=True, help_text='Χρόνος απόσβεσης με προεξόφληση', null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
