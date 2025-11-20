# Generated manually to populate UUID values
import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    AutomaticLightingControl = apps.get_model('automaticLightingControl', 'AutomaticLightingControl')
    for obj in AutomaticLightingControl.objects.all():
        if obj.uuid is None:
            obj.uuid = uuid.uuid4()
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('automaticLightingControl', '0002_automaticlightingcontrol_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, migrations.RunPython.noop),
    ]
