# Generated migration to add discounted_payback_period field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boilerReplacement', '0007_remove_boilerreplacement_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='boilerreplacement',
            name='discounted_payback_period',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Αυτόματος υπολογισμός προεξοφλημένης περιόδου αποπληρωμής', max_digits=8, null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
