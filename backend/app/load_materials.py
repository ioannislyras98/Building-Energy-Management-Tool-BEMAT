import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('c:/Users/glyras/Building-Energy-Management-Tool-BEMAT/backend/app')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

from materials.models import Material
from django.contrib.auth import get_user_model

User = get_user_model()

# Get admin user
try:
    admin_user = User.objects.get(email='admin@example.com')
except User.DoesNotExist:
    print("Admin user not found. Please create one first.")
    sys.exit(1)

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
        print(f'Created material: {material.name}')
    else:
        # Update thermal conductivity if different
        if material.thermal_conductivity != material_data['thermal_conductivity']:
            material.thermal_conductivity = material_data['thermal_conductivity']
            material.save()
            updated_count += 1
            print(f'Updated material: {material.name}')

print(f'Successfully processed materials: {created_count} created, {updated_count} updated')
