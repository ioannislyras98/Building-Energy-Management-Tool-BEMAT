from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from materials.models import Material

User = get_user_model()


class Command(BaseCommand):
    help = 'Load initial materials with thermal conductivity values'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS('Admin user created with username: admin, password: admin123')
            )

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

        for material_data in materials_data:
            material, created = Material.objects.get_or_create(
                name=material_data['name'],
                category=material_data['category'],
                defaults={
                    'thermal_conductivity': material_data['thermal_conductivity'],
                    'created_by': admin_user,
                    'description': f'Προκαθορισμένο υλικό με συντελεστή λ = {material_data["thermal_conductivity"]} W/mK'
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created material: {material.name}')
                )
            else:
                # Update thermal conductivity if different
                if material.thermal_conductivity != material_data['thermal_conductivity']:
                    material.thermal_conductivity = material_data['thermal_conductivity']
                    material.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Updated material: {material.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed materials: {created_count} created, {updated_count} updated'
            )
        )
