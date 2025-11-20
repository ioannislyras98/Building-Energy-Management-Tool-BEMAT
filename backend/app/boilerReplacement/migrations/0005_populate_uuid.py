# Generated manually to populate UUID values
import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    BoilerReplacement = apps.get_model('boilerReplacement', 'BoilerReplacement')
    for obj in BoilerReplacement.objects.all():
        if obj.uuid is None:
            obj.uuid = uuid.uuid4()
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('boilerReplacement', '0004_boilerreplacement_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, migrations.RunPython.noop),
    ]
