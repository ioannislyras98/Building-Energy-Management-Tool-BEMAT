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
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Delete materials not in the current list',
        )

    def handle(self, *args, **options):
        self.stdout.write('Loading materials data...')

        materials_data = [
            # Τοιχοποιία (Masonry)
            {'name': 'Τούβλο', 'category': 'masonry', 'thermal_conductivity': 0.727},
            {'name': 'Γυψοσανίδα', 'category': 'masonry', 'thermal_conductivity': 0.42},
            {'name': 'Πέτρα', 'category': 'masonry', 'thermal_conductivity': 0.87},
            
            # Σκυρόδεμα (Concrete)
            {'name': 'Οπλισματό Σκυρόδεμα', 'category': 'concrete', 'thermal_conductivity': 1.731},
            {'name': 'Απλό Σκυρόδεμα', 'category': 'concrete', 'thermal_conductivity': 2.10},
            {'name': 'Γαρμπιλοσκυρόδεμα', 'category': 'concrete', 'thermal_conductivity': 0.64},
            
            # Επιχρίσματα (Plaster)
            {'name': 'Ασβεστοκονίαμα', 'category': 'plaster', 'thermal_conductivity': 0.87},
            {'name': 'Γύψος', 'category': 'plaster', 'thermal_conductivity': 0.43},
            
            # Μονωτικά Υλικά (Insulation)
            {'name': 'Υαλοβάμβακας', 'category': 'insulation', 'thermal_conductivity': 0.045},
            {'name': 'Πολυουρεθάνη', 'category': 'insulation', 'thermal_conductivity': 0.031},
            {'name': 'Πετροβάμβακας', 'category': 'insulation', 'thermal_conductivity': 0.044},
            {'name': 'Διογκωμένη Πολυστερίνη', 'category': 'insulation', 'thermal_conductivity': 0.035},
            {'name': 'Εξηλασμένη Πολυστερίνη', 'category': 'insulation', 'thermal_conductivity': 0.033},
            
            # Πετρώματα (Stone)
            {'name': 'Γρανίτης', 'category': 'stone', 'thermal_conductivity': 3.50},
            {'name': 'Μάρμαρο', 'category': 'stone', 'thermal_conductivity': 3.50},
            
            # Μέταλλα (Metal)
            {'name': 'Χάλυβας', 'category': 'metal', 'thermal_conductivity': 1.80},
            {'name': 'Αλουμίνιο', 'category': 'metal', 'thermal_conductivity': 200.00},
            {'name': 'Χαλκός', 'category': 'metal', 'thermal_conductivity': 372.00},
            
            # Δάπεδα (Flooring)
            {'name': 'Άμμος', 'category': 'flooring', 'thermal_conductivity': 0.33},
            {'name': 'Άσφαλτος', 'category': 'flooring', 'thermal_conductivity': 0.74},
            
            # Γυαλί (Glass)
            {'name': 'Γυαλί', 'category': 'glass', 'thermal_conductivity': 1.00},
            
            # Υλικά Οροφής (Roof)
            {'name': 'Κεραμίδια', 'category': 'roof', 'thermal_conductivity': 0.7},
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0
        deleted_count = 0

        for material_data in materials_data:
            try:
                material, created = Material.objects.get_or_create(
                    name=material_data['name'],
                    category=material_data['category'],
                    defaults={
                        'thermal_conductivity': material_data['thermal_conductivity'],
                        'description': f'Προκαθορισμένο υλικό με συντελεστή λ = {material_data["thermal_conductivity"]} W/mK',
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'Created: {material.name}')
                else:
                    if (options['update'] and 
                        material.thermal_conductivity != material_data['thermal_conductivity']):
                        material.thermal_conductivity = material_data['thermal_conductivity']
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

        # Διαγραφή υλικών που δεν υπάρχουν στη λίστα
        if options['clean']:
            valid_material_ids = set()
            for material_data in materials_data:
                try:
                    material = Material.objects.get(
                        name=material_data['name'],
                        category=material_data['category']
                    )
                    valid_material_ids.add(material.uuid)
                except Material.DoesNotExist:
                    pass
            
            # Διαγραφή όσων δεν υπάρχουν
            materials_to_delete = Material.objects.exclude(uuid__in=valid_material_ids)
            deleted_count = materials_to_delete.count()
            for material in materials_to_delete:
                self.stdout.write(f'Deleting: {material.name}')
                material.delete()

        result_message = f'Materials loading completed: {created_count} created, {updated_count} updated, {skipped_count} skipped'
        if options['clean']:
            result_message += f', {deleted_count} deleted'
        
        self.stdout.write(
            self.style.SUCCESS(result_message)
        )
