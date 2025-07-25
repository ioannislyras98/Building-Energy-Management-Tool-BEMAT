# Generated by Django 5.1.6 on 2025-06-23 09:35

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Material',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, verbose_name='Όνομα Υλικού')),
                ('category', models.CharField(choices=[('wood', 'Ξυλεία'), ('concrete', 'Σκυρόδεμα'), ('insulation', 'Μονωτικά Υλικά'), ('metal', 'Μέταλλα'), ('glass', 'Γυαλί'), ('masonry', 'Τοιχοποιία'), ('other', 'Άλλα')], default='other', max_length=20, verbose_name='Κατηγορία Υλικού')),
                ('thermal_conductivity', models.FloatField(help_text='Συντελεστής θερμικής αγωγιμότητας σε W/mK', verbose_name='Τυπικός συντελεστής λ (W/mK)')),
                ('density', models.FloatField(blank=True, help_text='Πυκνότητα του υλικού σε kg/m³', null=True, verbose_name='Πυκνότητα (kg/m³)')),
                ('specific_heat', models.FloatField(blank=True, help_text='Ειδική θερμότητα σε J/kgK', null=True, verbose_name='Ειδική θερμότητα (J/kgK)')),
                ('description', models.TextField(blank=True, help_text='Επιπλέον πληροφορίες για το υλικό', verbose_name='Περιγραφή')),
                ('is_active', models.BooleanField(default=True, help_text='Αν το υλικό είναι διαθέσιμο για χρήση', verbose_name='Ενεργό')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Δημιουργήθηκε')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ενημερώθηκε')),
                ('created_by', models.ForeignKey(help_text='Μόνο admin μπορεί να δημιουργήσει υλικά', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Δημιουργός')),
            ],
            options={
                'verbose_name': 'Υλικό',
                'verbose_name_plural': 'Υλικά',
                'ordering': ['category', 'name'],
                'unique_together': {('name', 'category')},
            },
        ),
    ]
