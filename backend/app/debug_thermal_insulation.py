#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from thermalInsulation.models import ExternalWallThermalInsulation
from building.models import Building

# Get all thermal insulation records
thermal_insulations = ExternalWallThermalInsulation.objects.all()

print(f"Total Thermal Insulation records: {thermal_insulations.count()}")

for ti in thermal_insulations:
    print(f"Building: {ti.building.name if ti.building else 'No Building'}")
    print(f"Building UUID: {ti.building.uuid if ti.building else 'No Building'}")
    print(f"NPV: {ti.net_present_value}")
    print(f"Total Cost: {ti.total_cost}")
    print("---")

# Check specific building
target_uuid = "7e92f88f-9ddf-48b0-b6c7-aacc9f094e26"
try:
    building = Building.objects.get(uuid=target_uuid)
    print(f"\nChecking building: {building.name} ({building.uuid})")
    
    # Get thermal insulations for this building directly
    building_thermal = ExternalWallThermalInsulation.objects.filter(building=building)
    print(f"Thermal insulations for this building: {building_thermal.count()}")
    
    for ti in building_thermal:
        print(f"UUID: {ti.uuid}")
        print(f"NPV: {ti.net_present_value}")
        print(f"Is NPV != 0: {ti.net_present_value != 0 if ti.net_present_value is not None else False}")
        print(f"Is NPV not null: {ti.net_present_value is not None}")
        print("---")
    
    # Test the filter we use in views
    filtered = building_thermal.filter(net_present_value__isnull=False).exclude(net_present_value=0)
    print(f"Filtered thermal insulations (NPV != 0): {filtered.count()}")
    
    for ti in filtered:
        print(f"Filtered record - UUID: {ti.uuid}, NPV: {ti.net_present_value}")
        
except Building.DoesNotExist:
    print(f"Building with UUID {target_uuid} not found")
