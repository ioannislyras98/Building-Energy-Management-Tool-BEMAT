# Generated migration to add discounted_payback_period field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('windowReplacement', '0004_alter_windowreplacement_cost_per_sqm'),
    ]

    operations = [
        migrations.AddField(
            model_name='windowreplacement',
            name='discounted_payback_period',
            field=models.FloatField(blank=True, help_text='Προεξοφλημένη περίοδος αποπληρωμής της επένδυσης σε έτη', null=True, verbose_name='Προεξοφλημένη περίοδος αποπληρωμής (έτη)'),
        ),
    ]
