from django.db import models
from django.utils import timezone
import uuid

class Project(models.Model):
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=100)
    date_created = models.DateField(default=timezone.now)
    cost_per_kwh_fuel = models.DecimalField(
        max_digits=6, 
        decimal_places=3,
        verbose_name="Κόστος ανά kWh καυσίμου (€)"
    )
    cost_per_kwh_electricity = models.DecimalField(
        max_digits=6, 
        decimal_places=3,
        verbose_name="Κόστος ανά kWh ρεύματος (€)"
    )
    user = models.ForeignKey(
        'user.User', 
        on_delete=models.CASCADE,
        related_name="projects"
    )
    buildings_count = models.IntegerField(
        default=0, 
        verbose_name="Αριθμός Κτιρίων",
        editable=False  # Managed by signals, not direct user input
    )
    is_submitted = models.BooleanField(
        default=False,
        verbose_name="Έχει Υποβληθεί"
    )

    class Meta:
        unique_together = (("user", "name"),)

    def get_completion_status(self):
        """
        Calculate completion status for the project.
        Returns:
        - total_buildings: total number of buildings in project
        - buildings_progress: list of building progress data
        - overall_systems_progress: overall systems completion percentage
        - overall_scenarios_progress: overall scenarios completion percentage
        - can_submit: whether project can be submitted
        """
        buildings = self.buildings.all()
        total_buildings = buildings.count()
        
        if total_buildings == 0:
            return {
                'total_buildings': 0,
                'buildings_progress': [],
                'overall_systems_progress': 0,
                'overall_scenarios_progress': 0,
                'can_submit': False
            }
        
        buildings_progress = []
        total_systems_completed = 0
        total_scenarios_completed = 0
        total_systems_required = total_buildings * 5  # 5 systems per building
        total_scenarios_required = total_buildings * 11  # 11 scenarios per building
        
        for building in buildings:
            # Count completed systems (5 systems)
            systems_completed = 0
            # 1. Boiler Details
            if hasattr(building, 'boiler_details') and building.boiler_details.exists():
                systems_completed += 1
            # 2. Cooling System
            if hasattr(building, 'cooling_systems') and building.cooling_systems.exists():
                systems_completed += 1
            # 3. Heating System
            if hasattr(building, 'heating_systems') and building.heating_systems.exists():
                systems_completed += 1
            # 4. Hot Water System (HWS)
            if hasattr(building, 'domestic_hot_water_systems') and building.domestic_hot_water_systems.exists():
                systems_completed += 1
            # 5. Solar Collectors
            if hasattr(building, 'solar_collectors') and building.solar_collectors.exists():
                systems_completed += 1
            
            # Count completed scenarios (11 scenarios) - A scenario is complete only if NPV != 0
            scenarios_completed = 0
            # windowReplacement uses default related name
            if hasattr(building, 'windowreplacement_set') and building.windowreplacement_set.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            # bulbReplacement uses default related name  
            if hasattr(building, 'bulbreplacement_set') and building.bulbreplacement_set.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            if hasattr(building, 'boiler_replacements') and building.boiler_replacements.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            # Air conditioning has multiple related names, check only ac_analyses which has NPV
            if hasattr(building, 'ac_analyses') and building.ac_analyses.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            if hasattr(building, 'roof_thermal_insulations') and building.roof_thermal_insulations.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            # External Wall Thermal Insulation
            if hasattr(building, 'externalwallthermalinsulation_set') and building.externalwallthermalinsulation_set.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            if hasattr(building, 'exterior_blinds') and building.exterior_blinds.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            # Photovoltaic systems - check for NPV != 0
            if hasattr(building, 'photovoltaic_systems') and building.photovoltaic_systems.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            # hotWaterUpgrade uses default related name
            if hasattr(building, 'hotwaterupgrade_set') and building.hotwaterupgrade_set.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            if hasattr(building, 'automatic_lighting_controls') and building.automatic_lighting_controls.filter(net_present_value__isnull=False).exclude(net_present_value=0).exists():
                scenarios_completed += 1
            
            building_progress = {
                'building_uuid': str(building.uuid),
                'building_name': building.name,
                'systems_completed': systems_completed,
                'systems_total': 5,
                'systems_percentage': round((systems_completed / 5) * 100, 1),
                'scenarios_completed': scenarios_completed,
                'scenarios_total': 11,
                'scenarios_percentage': round((scenarios_completed / 11) * 100, 1),
                'is_complete': systems_completed == 5 and scenarios_completed == 11
            }
            
            buildings_progress.append(building_progress)
            total_systems_completed += systems_completed
            total_scenarios_completed += scenarios_completed
        
        overall_systems_progress = round((total_systems_completed / total_systems_required) * 100, 1) if total_systems_required > 0 else 0
        overall_scenarios_progress = round((total_scenarios_completed / total_scenarios_required) * 100, 1) if total_scenarios_required > 0 else 0
        
        # Project can be submitted if all buildings are complete
        can_submit = all(building['is_complete'] for building in buildings_progress)
        
        return {
            'total_buildings': total_buildings,
            'buildings_progress': buildings_progress,
            'overall_systems_progress': overall_systems_progress,
            'overall_scenarios_progress': overall_scenarios_progress,
            'can_submit': can_submit,
            'systems_completed': total_systems_completed,
            'systems_total': total_systems_required,
            'scenarios_completed': total_scenarios_completed,
            'scenarios_total': total_scenarios_required
        }

    def __str__(self):
        return self.name