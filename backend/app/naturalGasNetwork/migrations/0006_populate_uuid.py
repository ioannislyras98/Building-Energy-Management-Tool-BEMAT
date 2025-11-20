# Generated manually to populate UUID values
import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    NaturalGasNetwork = apps.get_model('naturalGasNetwork', 'NaturalGasNetwork')
    for obj in NaturalGasNetwork.objects.all():
        if obj.uuid is None:
            obj.uuid = uuid.uuid4()
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('naturalGasNetwork', '0005_naturalgasnetwork_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, migrations.RunPython.noop),
    ]
