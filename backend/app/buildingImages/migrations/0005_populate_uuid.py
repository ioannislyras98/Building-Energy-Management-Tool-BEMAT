# Generated manually to populate UUID values
import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    BuildingImage = apps.get_model('buildingImages', 'BuildingImage')
    for obj in BuildingImage.objects.all():
        if obj.uuid is None:
            obj.uuid = uuid.uuid4()
            obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('buildingImages', '0004_buildingimage_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, migrations.RunPython.noop),
    ]
