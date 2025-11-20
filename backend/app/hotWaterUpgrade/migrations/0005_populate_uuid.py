# Generated manually to populate UUID values
import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    HotWaterUpgrade = apps.get_model('hotWaterUpgrade', 'HotWaterUpgrade')
    for obj in HotWaterUpgrade.objects.all():
        if obj.uuid is None:
            obj.uuid = uuid.uuid4()
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('hotWaterUpgrade', '0004_hotwaterupgrade_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, migrations.RunPython.noop),
    ]
