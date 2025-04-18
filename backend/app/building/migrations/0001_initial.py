# Generated by Django 5.1.6 on 2025-03-29 15:31

import django.core.validators
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('project', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Building',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, verbose_name='Σύνολο Κτιρίου')),
                ('usage', models.CharField(help_text='π.χ. Νοσοκομείο, Κλινικές', max_length=100, verbose_name='Χρήση Κτιρίου')),
                ('description', models.TextField(blank=True, verbose_name='Περιγραφή')),
                ('year_built', models.PositiveIntegerField(blank=True, null=True, verbose_name='Έτος Κατασκευής')),
                ('address', models.CharField(blank=True, max_length=200, verbose_name='Διεύθυνση')),
                ('is_insulated', models.BooleanField(default=False, verbose_name='Μονωμένο')),
                ('is_certified', models.BooleanField(default=False, verbose_name='Πιστοποιημένο')),
                ('energy_class', models.CharField(blank=True, max_length=50, verbose_name='Ενεργειακή Κλάση')),
                ('orientation', models.CharField(blank=True, help_text='π.χ. Βόρειος, Νότιος, Ανατολικός, Δυτικός', max_length=50, verbose_name='Προσανατολισμός')),
                ('total_area', models.DecimalField(decimal_places=2, max_digits=8, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Συνολική Επιφάνεια (m²)')),
                ('examined_area', models.DecimalField(decimal_places=2, max_digits=8, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Εξεταζόμενη Επιφάνεια (m²)')),
                ('floors_examined', models.PositiveIntegerField(default=1, verbose_name='Αριθμός Εξεταζόμενων Ορόφων')),
                ('room_temperature', models.DecimalField(decimal_places=2, default=25, max_digits=5, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Θερμοκρασία Χώρου (°C)')),
                ('no_ppm', models.DecimalField(decimal_places=2, help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65', max_digits=5, validators=[django.core.validators.MaxValueValidator(65)], verbose_name='Μονοξείδιο του Αζώτου - NO (ppm)')),
                ('nox_ppm', models.DecimalField(decimal_places=2, help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 65', max_digits=5, validators=[django.core.validators.MaxValueValidator(65)], verbose_name='Οξείδια του Αζώτου - NOx (ppm)')),
                ('co2_ppm', models.DecimalField(decimal_places=2, help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 125', max_digits=5, validators=[django.core.validators.MaxValueValidator(125)], verbose_name='Διοξείδιο του Άνθρακα (ppm)')),
                ('smoke_scale', models.PositiveIntegerField(help_text='Βεβαιωθείτε ότι η τιμή είναι ≤ 9', validators=[django.core.validators.MaxValueValidator(9)], verbose_name='Κάπνός (Brigon smoke scale 0-9)')),
                ('exhaust_temperature', models.DecimalField(decimal_places=2, help_text='Βεβαιωθείτε ότι η τιμή είναι ≥ 180', max_digits=5, validators=[django.core.validators.MinValueValidator(180)], verbose_name='Θερμοκρασία Καυσαερίων (°C)')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buildings', to='project.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buildings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
