from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Project)
def update_all_scenarios_on_project_change(sender, instance, **kwargs):
    """
    Όταν ενημερώνεται ένα Project (τιμές ενέργειας), επαναϋπολογίζουμε όλα τα σενάρια
    που εξαρτώνται από τις τιμές:
    - oil_price_per_liter (πετρέλαιο θέρμανσης)
    - natural_gas_price_per_m3 (φυσικό αέριο)
    - cost_per_kwh_electricity (ηλεκτρική ενέργεια)
    - biomass_price_per_kg (βιομάζα)
    """
    try:
        from naturalGasNetwork.models import NaturalGasNetwork
        from boilerReplacement.models import BoilerReplacement
        from photovoltaicSystem.models import PhotovoltaicSystem
        from thermalInsulation.models import ExternalWallThermalInsulation
        from roofThermalInsulation.models import RoofThermalInsulation
        from exteriorBlinds.models import ExteriorBlinds
        from energyConsumption.models import EnergyConsumption
        
        updated_counts = {}
        
        # 1. Ενημέρωση Natural Gas Networks
        # Το save() επαναϋπολογίζει αυτόματα όλα τα πεδία που εξαρτώνται από τιμές Project
        networks = NaturalGasNetwork.objects.filter(
            building__project=instance
        ).select_related('building')
        
        for network in networks:
            # Το save() θα επαναϋπολογίσει:
            # - current_energy_cost_per_year (με νέα oil_price_per_liter)
            # - natural_gas_cost_per_year (με νέα natural_gas_price_per_m3)
            # - annual_energy_savings (διαφορά των παραπάνω)
            # - Όλους τους οικονομικούς δείκτες (NPV, IRR, Payback)
            network.save()
        
        updated_counts['NaturalGasNetwork'] = networks.count()
        
        # 2. Ενημέρωση Boiler Replacements (χρησιμοποιούν oil_price_per_liter)
        boiler_replacements = BoilerReplacement.objects.filter(
            project=instance
        )
        
        for boiler in boiler_replacements:
            boiler.oil_price_per_liter = instance.oil_price_per_liter
            boiler.save()
        
        updated_counts['BoilerReplacement'] = boiler_replacements.count()
        
        # 3. Ενημέρωση Photovoltaic Systems (χρησιμοποιούν cost_per_kwh_electricity)
        pv_systems = PhotovoltaicSystem.objects.filter(
            project=instance
        )
        
        for pv in pv_systems:
            # Επαναϋπολογισμός με νέα τιμή ρεύματος
            pv.save()  # Το save() ξανακάνει όλους τους υπολογισμούς
        
        updated_counts['PhotovoltaicSystem'] = pv_systems.count()
        
        # 4. Ενημέρωση Thermal Insulations (χρησιμοποιούν cost_per_kwh_electricity)
        thermal_insulations = ExternalWallThermalInsulation.objects.filter(
            project=instance
        )
        
        for insulation in thermal_insulations:
            insulation.save()
        
        updated_counts['ThermalInsulation'] = thermal_insulations.count()
        
        # 5. Ενημέρωση Roof Thermal Insulations
        roof_insulations = RoofThermalInsulation.objects.filter(
            project=instance
        )
        
        for roof in roof_insulations:
            roof.save()
        
        updated_counts['RoofThermalInsulation'] = roof_insulations.count()
        
        # 6. Ενημέρωση Exterior Blinds (χρησιμοποιούν cost_per_kwh_electricity)
        blinds = ExteriorBlinds.objects.filter(
            project=instance
        )
        
        for blind in blinds:
            blind.save()
        
        updated_counts['ExteriorBlinds'] = blinds.count()
        
        # Log summary
        total_updated = sum(updated_counts.values())
        if total_updated > 0:
            logger.info(f"Updated {total_updated} scenarios for project {instance.name}: {updated_counts}")
        
    except Exception as e:
        logger.error(f"Error updating scenarios for project {instance.uuid}: {str(e)}")
