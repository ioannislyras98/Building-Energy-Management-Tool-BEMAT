from django.core.management.base import BaseCommand
from materials.models import Material


class Command(BaseCommand):
    help = 'Load initial materials data into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing materials if thermal conductivity differs',
        )

    def handle(self, *args, **options):
        self.stdout.write('Loading materials data...')

        # Initial materials data
        materials_data = [
            # Wood materials
            {'name': 'Ερυθρά Ξυλεία', 'category': 'wood', 'thermal_conductivity': 0.11},
            {'name': 'Λευκή Ξυλεία', 'category': 'wood', 'thermal_conductivity': 0.12},
            {'name': 'Βελανιδιά - Οξυά', 'category': 'wood', 'thermal_conductivity': 0.18},
            
            # Concrete materials
            {'name': 'Οπλισμένο Σκυρόδεμα', 'category': 'concrete', 'thermal_conductivity': 2.10},
            {'name': 'Τσιμεντοκονίαμα', 'category': 'concrete', 'thermal_conductivity': 1.40},
            
            # Glass
            {'name': 'Υαλοπίνακας', 'category': 'glass', 'thermal_conductivity': 1.00},
            
            # Masonry
            {'name': 'Γυψοσανίδα', 'category': 'masonry', 'thermal_conductivity': 0.42},
            {'name': 'Πέτρα', 'category': 'masonry', 'thermal_conductivity': 1.75},
            
            # Metals
            {'name': 'Αλουμίνιο', 'category': 'metal', 'thermal_conductivity': 200.00},
            {'name': 'Χάλυβας', 'category': 'metal', 'thermal_conductivity': 60.00},
            
            # Insulation materials
            {'name': 'Ορυκτοβάμβακας', 'category': 'insulation', 'thermal_conductivity': 0.035},
            {'name': 'Οικοδομική Μόνωση', 'category': 'insulation', 'thermal_conductivity': 0.035},
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for material_data in materials_data:
            try:
                material, created = Material.objects.get_or_create(
                    name=material_data['name'],
                    category=material_data['category'],
                    defaults={
                        'thermal_conductivity': material_data['thermal_conductivity'],
                        'density': material_data.get('density'),
                        'specific_heat': material_data.get('specific_heat'),
                        'description': f'Προκαθορισμένο υλικό με συντελεστή λ = {material_data["thermal_conductivity"]} W/mK',
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'Created: {material.name}')
                else:
                    # Update thermal conductivity if different and update flag is set
                    if (options['update'] and 
                        material.thermal_conductivity != material_data['thermal_conductivity']):
                        material.thermal_conductivity = material_data['thermal_conductivity']
                        material.density = material_data.get('density')
                        material.specific_heat = material_data.get('specific_heat')
                        material.description = f'Προκαθορισμένο υλικό με συντελεστή λ = {material_data["thermal_conductivity"]} W/mK'
                        material.save()
                        updated_count += 1
                        self.stdout.write(f'Updated: {material.name}')
                    else:
                        skipped_count += 1
                        
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error processing {material_data["name"]}: {str(e)}')
                )

        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'Materials loading completed: {created_count} created, {updated_count} updated, {skipped_count} skipped'
            )
        )
