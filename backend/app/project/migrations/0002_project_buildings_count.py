# Generated by Django 5.1.6 on 2025-05-10 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='buildings_count',
            field=models.IntegerField(default=0, editable=False, verbose_name='Αριθμός Κτιρίων'),
        ),
    ]
