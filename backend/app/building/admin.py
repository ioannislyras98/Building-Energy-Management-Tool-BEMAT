from django.contrib import admin
from .models import Building

class BuildingAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'project',
        'usage',
        'description',
        'year_built',
        'address',
        'is_insulated',
        'is_certified',
        'energy_class',
        'orientation',
        'total_area',
        'examined_area',
        'floors_examined',
        'floor_height',
        'date_created',
        # Αφαίρεση των σχολιασμένων πεδίων
        # 'room_temperature',
        # 'no_ppm',
        # 'nox_ppm',
        # 'co2_ppm',
        # 'smoke_scale',
        # 'exhaust_temperature',
    )

admin.site.register(Building, BuildingAdmin)