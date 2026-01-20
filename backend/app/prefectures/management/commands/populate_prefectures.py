from django.core.management.base import BaseCommand
from prefectures.models import Prefecture


class Command(BaseCommand):
    help = 'Populate the prefectures table with initial data'

    def handle(self, *args, **options):
        # Ηλιακή ακτινοβολία ανά νομό (kWh/m²/έτος) - Πηγή: ΚΕΝΑΚ/ΤΕΕ
        # Η ημερήσια υπολογίζεται: annual / 365
        
        prefecture_data = [
            # Ζώνη Α - Νότια Ελλάδα, Νησιά
            {'name': 'Ηρακλείου', 'zone': 'A', 'temperature_winter': 12.5, 'temperature_summer': 26.8, 'annual_solar': 1751.6},
            {'name': 'Χανίων', 'zone': 'A', 'temperature_winter': 12.2, 'temperature_summer': 26.5, 'annual_solar': 1755.0},
            {'name': 'Ρεθύμνου', 'zone': 'A', 'temperature_winter': 12.8, 'temperature_summer': 26.9, 'annual_solar': 1687.2},
            {'name': 'Λασιθίου', 'zone': 'A', 'temperature_winter': 11.5, 'temperature_summer': 25.8, 'annual_solar': 1735.6},
            {'name': 'Κυκλάδων', 'zone': 'A', 'temperature_winter': 13.2, 'temperature_summer': 25.5, 'annual_solar': 1679.8},
            {'name': 'Δωδεκανήσου', 'zone': 'A', 'temperature_winter': 14.1, 'temperature_summer': 27.2, 'annual_solar': 1679.1},
            {'name': 'Σάμου', 'zone': 'A', 'temperature_winter': 13.5, 'temperature_summer': 26.8, 'annual_solar': 1729.4},
            {'name': 'Μεσσηνίας', 'zone': 'A', 'temperature_winter': 11.8, 'temperature_summer': 26.2, 'annual_solar': 1673.3},
            {'name': 'Λακωνίας', 'zone': 'A', 'temperature_winter': 11.2, 'temperature_summer': 25.9, 'annual_solar': 1709.0},
            {'name': 'Αργολίδας', 'zone': 'A', 'temperature_winter': 12.1, 'temperature_summer': 26.8, 'annual_solar': 1705.2},
            {'name': 'Αρκαδίας', 'zone': 'A', 'temperature_winter': 10.5, 'temperature_summer': 25.2, 'annual_solar': 1705.2},
            {'name': 'Κορινθίας', 'zone': 'A', 'temperature_winter': 11.9, 'temperature_summer': 26.5, 'annual_solar': 1607.8},
            {'name': 'Αχαΐας', 'zone': 'A', 'temperature_winter': 12.3, 'temperature_summer': 26.1, 'annual_solar': 1609.9},
            {'name': 'Ηλείας', 'zone': 'A', 'temperature_winter': 12.5, 'temperature_summer': 26.8, 'annual_solar': 1684.8},
            
            # Ζώνη Β - Κεντρική Ελλάδα
            {'name': 'Αιτωλοακαρνανίας', 'zone': 'B', 'temperature_winter': 9.8, 'temperature_summer': 25.5, 'annual_solar': 1679.4},
            {'name': 'Φθιώτιδας', 'zone': 'B', 'temperature_winter': 9.2, 'temperature_summer': 25.1, 'annual_solar': 1559.0},
            {'name': 'Φωκίδας', 'zone': 'B', 'temperature_winter': 8.9, 'temperature_summer': 24.8, 'annual_solar': 1559.0},
            {'name': 'Βοιωτίας', 'zone': 'B', 'temperature_winter': 9.5, 'temperature_summer': 25.8, 'annual_solar': 1604.1},
            {'name': 'Εύβοιας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.9, 'annual_solar': 1604.1},
            {'name': 'Μαγνησίας', 'zone': 'B', 'temperature_winter': 10.2, 'temperature_summer': 25.2, 'annual_solar': 1573.4},
            {'name': 'Λέσβου', 'zone': 'B', 'temperature_winter': 11.5, 'temperature_summer': 25.8, 'annual_solar': 1628.0},
            {'name': 'Χίου', 'zone': 'B', 'temperature_winter': 12.2, 'temperature_summer': 26.1, 'annual_solar': 1664.0},
            {'name': 'Κέρκυρας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.5, 'annual_solar': 1592.4},
            {'name': 'Λευκάδας', 'zone': 'B', 'temperature_winter': 11.1, 'temperature_summer': 25.8, 'annual_solar': 1616.9},
            {'name': 'Θεσπρωτίας', 'zone': 'B', 'temperature_winter': 9.5, 'temperature_summer': 25.2, 'annual_solar': 1476.4},
            {'name': 'Πρέβεζας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.9, 'annual_solar': 1616.9},
            {'name': 'Άρτας', 'zone': 'B', 'temperature_winter': 9.1, 'temperature_summer': 25.5, 'annual_solar': 1616.9},
            {'name': 'Ιωαννίνων', 'zone': 'B', 'temperature_winter': 7.8, 'temperature_summer': 24.2, 'annual_solar': 1476.4},
            {'name': 'Τρικάλων', 'zone': 'B', 'temperature_winter': 8.5, 'temperature_summer': 24.8, 'annual_solar': 1551.2},
            {'name': 'Καρδίτσας', 'zone': 'B', 'temperature_winter': 8.2, 'temperature_summer': 24.5, 'annual_solar': 1551.2},
            {'name': 'Λαρίσης', 'zone': 'B', 'temperature_winter': 8.8, 'temperature_summer': 25.1, 'annual_solar': 1551.2},
            {'name': 'Πιερίας', 'zone': 'B', 'temperature_winter': 8.9, 'temperature_summer': 24.9, 'annual_solar': 1464.1},
            {'name': 'Ημαθίας', 'zone': 'B', 'temperature_winter': 8.1, 'temperature_summer': 24.5, 'annual_solar': 1436.8},
            {'name': 'Πέλλας', 'zone': 'B', 'temperature_winter': 8.3, 'temperature_summer': 24.8, 'annual_solar': 1464.1},
            {'name': 'Αττικής', 'zone': 'B', 'temperature_winter': 11.8, 'temperature_summer': 27.2, 'annual_solar': 1635.5},
            
            # Ζώνη Γ - Βόρεια Ελλάδα
            {'name': 'Θεσσαλονίκης', 'zone': 'C', 'temperature_winter': 7.5, 'temperature_summer': 23.8, 'annual_solar': 1464.1},
            {'name': 'Κιλκίς', 'zone': 'C', 'temperature_winter': 6.8, 'temperature_summer': 23.2, 'annual_solar': 1464.1},
            {'name': 'Χαλκιδικής', 'zone': 'C', 'temperature_winter': 8.2, 'temperature_summer': 24.5, 'annual_solar': 1464.1},
            {'name': 'Σερρών', 'zone': 'C', 'temperature_winter': 6.5, 'temperature_summer': 23.1, 'annual_solar': 1433.9},
            {'name': 'Καβάλας', 'zone': 'C', 'temperature_winter': 7.8, 'temperature_summer': 24.2, 'annual_solar': 1517.6},
            {'name': 'Ξάνθης', 'zone': 'C', 'temperature_winter': 7.2, 'temperature_summer': 23.9, 'annual_solar': 1567.0},
            {'name': 'Ροδόπης', 'zone': 'C', 'temperature_winter': 7.5, 'temperature_summer': 24.1, 'annual_solar': 1567.0},
            {'name': 'Έβρου', 'zone': 'C', 'temperature_winter': 7.1, 'temperature_summer': 23.8, 'annual_solar': 1499.7},
            
            # Ζώνη Δ - Ορεινή Ελλάδα
            {'name': 'Γρεβενών', 'zone': 'D', 'temperature_winter': 5.2, 'temperature_summer': 22.5, 'annual_solar': 1498.6},
            {'name': 'Κοζάνης', 'zone': 'D', 'temperature_winter': 5.8, 'temperature_summer': 22.8, 'annual_solar': 1498.6},
            {'name': 'Καστοριάς', 'zone': 'D', 'temperature_winter': 4.5, 'temperature_summer': 22.1, 'annual_solar': 1498.6},
            {'name': 'Φλώρινας', 'zone': 'D', 'temperature_winter': 4.2, 'temperature_summer': 21.9, 'annual_solar': 1498.6},
            {'name': 'Δράμας', 'zone': 'D', 'temperature_winter': 5.9, 'temperature_summer': 23.2, 'annual_solar': 1517.6},
        ]

        created_count = 0
        updated_count = 0
        for data in prefecture_data:
            zone = data['zone']
            annual_solar_radiation = data['annual_solar']
            # Υπολογισμός ημερήσιας ηλιακής ακτινοβολίας
            solar_radiation = round(annual_solar_radiation / 365, 2)
            
            prefecture, created = Prefecture.objects.get_or_create(
                name=data['name'],
                defaults={
                    'zone': zone,
                    'temperature_winter': data['temperature_winter'],
                    'temperature_summer': data['temperature_summer'],
                    'solar_radiation': solar_radiation,
                    'annual_solar_radiation': annual_solar_radiation,
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created prefecture: {prefecture.name} (Zone {zone}, Solar: {solar_radiation} kWh/m²/day, Annual: {annual_solar_radiation} kWh/m²/year)")
            else:
                # Ενημέρωση όλων των πεδίων πάντα
                prefecture.zone = zone
                prefecture.temperature_winter = data['temperature_winter']
                prefecture.temperature_summer = data['temperature_summer']
                prefecture.solar_radiation = solar_radiation
                prefecture.annual_solar_radiation = annual_solar_radiation
                prefecture.save()
                updated_count += 1
                self.stdout.write(f"Updated prefecture: {prefecture.name} (Zone {zone}, Solar: {solar_radiation} kWh/m²/day, Annual: {annual_solar_radiation} kWh/m²/year)")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} prefectures and updated {updated_count} with solar radiation values')
        )
