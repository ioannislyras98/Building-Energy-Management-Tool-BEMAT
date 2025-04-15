from django.contrib import admin
from .models import Building

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = (
        "uuid",
        "project",
        "user",
        "name",
        "usage",
        "description",
        "year_built",
        "address",
        "is_insulated",
        "is_certified",
        "energy_class",
        "orientation",
        "total_area",
        "examined_area",
        "floors_examined",
        "room_temperature",
        "no_ppm",
        "nox_ppm",
        "co2_ppm",
        "smoke_scale",
        "exhaust_temperature",
    )
