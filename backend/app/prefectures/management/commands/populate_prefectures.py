from django.core.management.base import BaseCommand
from prefectures.models import Prefecture


class Command(BaseCommand):
    help = 'Populate the prefectures table with initial data'

    def handle(self, *args, **options):
        prefecture_data = [
            {'name': 'Ηρακλείου', 'zone': 'A', 'temperature_winter': 12.5, 'temperature_summer': 26.8},
            {'name': 'Χανίων', 'zone': 'A', 'temperature_winter': 12.2, 'temperature_summer': 26.5},
            {'name': 'Ρεθύμνου', 'zone': 'A', 'temperature_winter': 12.8, 'temperature_summer': 26.9},
            {'name': 'Λασιθίου', 'zone': 'A', 'temperature_winter': 11.5, 'temperature_summer': 25.8},
            {'name': 'Κυκλάδων', 'zone': 'A', 'temperature_winter': 13.2, 'temperature_summer': 25.5},
            {'name': 'Δωδεκανήσου', 'zone': 'A', 'temperature_winter': 14.1, 'temperature_summer': 27.2},
            {'name': 'Σάμου', 'zone': 'A', 'temperature_winter': 13.5, 'temperature_summer': 26.8},
            {'name': 'Μεσσηνίας', 'zone': 'A', 'temperature_winter': 11.8, 'temperature_summer': 26.2},
            {'name': 'Λακωνίας', 'zone': 'A', 'temperature_winter': 11.2, 'temperature_summer': 25.9},
            {'name': 'Αργολίδας', 'zone': 'A', 'temperature_winter': 12.1, 'temperature_summer': 26.8},
            {'name': 'Αρκαδίας', 'zone': 'A', 'temperature_winter': 10.5, 'temperature_summer': 25.2},
            {'name': 'Κορινθίας', 'zone': 'A', 'temperature_winter': 11.9, 'temperature_summer': 26.5},
            {'name': 'Αχαΐας', 'zone': 'A', 'temperature_winter': 12.3, 'temperature_summer': 26.1},
            {'name': 'Ηλείας', 'zone': 'A', 'temperature_winter': 12.5, 'temperature_summer': 26.8},
            
            {'name': 'Αιτωλοακαρνανίας', 'zone': 'B', 'temperature_winter': 9.8, 'temperature_summer': 25.5},
            {'name': 'Φθιώτιδας', 'zone': 'B', 'temperature_winter': 9.2, 'temperature_summer': 25.1},
            {'name': 'Φωκίδας', 'zone': 'B', 'temperature_winter': 8.9, 'temperature_summer': 24.8},
            {'name': 'Βοιωτίας', 'zone': 'B', 'temperature_winter': 9.5, 'temperature_summer': 25.8},
            {'name': 'Εύβοιας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.9},
            {'name': 'Μαγνησίας', 'zone': 'B', 'temperature_winter': 10.2, 'temperature_summer': 25.2},
            {'name': 'Λέσβου', 'zone': 'B', 'temperature_winter': 11.5, 'temperature_summer': 25.8},
            {'name': 'Χίου', 'zone': 'B', 'temperature_winter': 12.2, 'temperature_summer': 26.1},
            {'name': 'Κέρκυρας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.5},
            {'name': 'Λευκάδας', 'zone': 'B', 'temperature_winter': 11.1, 'temperature_summer': 25.8},
            {'name': 'Θεσπρωτίας', 'zone': 'B', 'temperature_winter': 9.5, 'temperature_summer': 25.2},
            {'name': 'Πρέβεζας', 'zone': 'B', 'temperature_winter': 10.8, 'temperature_summer': 25.9},
            {'name': 'Άρτας', 'zone': 'B', 'temperature_winter': 9.1, 'temperature_summer': 25.5},
            {'name': 'Ιωαννίνων', 'zone': 'B', 'temperature_winter': 7.8, 'temperature_summer': 24.2},
            {'name': 'Τρικάλων', 'zone': 'B', 'temperature_winter': 8.5, 'temperature_summer': 24.8},
            {'name': 'Καρδίτσας', 'zone': 'B', 'temperature_winter': 8.2, 'temperature_summer': 24.5},
            {'name': 'Λαρίσης', 'zone': 'B', 'temperature_winter': 8.8, 'temperature_summer': 25.1},
            {'name': 'Πιερίας', 'zone': 'B', 'temperature_winter': 8.9, 'temperature_summer': 24.9},
            {'name': 'Ημαθίας', 'zone': 'B', 'temperature_winter': 8.1, 'temperature_summer': 24.5},
            {'name': 'Πέλλας', 'zone': 'B', 'temperature_winter': 8.3, 'temperature_summer': 24.8},
            {'name': 'Αττικής', 'zone': 'B', 'temperature_winter': 11.8, 'temperature_summer': 27.2},
            
            {'name': 'Θεσσαλονίκης', 'zone': 'C', 'temperature_winter': 7.5, 'temperature_summer': 23.8},
            {'name': 'Κιλκίς', 'zone': 'C', 'temperature_winter': 6.8, 'temperature_summer': 23.2},
            {'name': 'Χαλκιδικής', 'zone': 'C', 'temperature_winter': 8.2, 'temperature_summer': 24.5},
            {'name': 'Σερρών (ΒΑ τμήμα)', 'zone': 'C', 'temperature_winter': 6.5, 'temperature_summer': 23.1},
            {'name': 'Καβάλας', 'zone': 'C', 'temperature_winter': 7.8, 'temperature_summer': 24.2},
            {'name': 'Ξάνθης', 'zone': 'C', 'temperature_winter': 7.2, 'temperature_summer': 23.9},
            {'name': 'Ροδόπης', 'zone': 'C', 'temperature_winter': 7.5, 'temperature_summer': 24.1},
            {'name': 'Έβρου', 'zone': 'C', 'temperature_winter': 7.1, 'temperature_summer': 23.8},
            
            {'name': 'Γρεβενών', 'zone': 'D', 'temperature_winter': 5.2, 'temperature_summer': 22.5},
            {'name': 'Κοζάνης', 'zone': 'D', 'temperature_winter': 5.8, 'temperature_summer': 22.8},
            {'name': 'Καστοριάς', 'zone': 'D', 'temperature_winter': 4.5, 'temperature_summer': 22.1},
            {'name': 'Φλώρινας', 'zone': 'D', 'temperature_winter': 4.2, 'temperature_summer': 21.9},
            {'name': 'Σερρών (εκτός ΒΑ τμήματος)', 'zone': 'D', 'temperature_winter': 5.5, 'temperature_summer': 22.8},
            {'name': 'Δράμας', 'zone': 'D', 'temperature_winter': 5.9, 'temperature_summer': 23.2},
        ]

        created_count = 0
        for data in prefecture_data:
            prefecture, created = Prefecture.objects.get_or_create(
                name=data['name'],
                defaults={
                    'zone': data['zone'],
                    'temperature_winter': data['temperature_winter'],
                    'temperature_summer': data['temperature_summer'],
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created prefecture: {prefecture.name}")
            else:
                self.stdout.write(f"Prefecture already exists: {prefecture.name}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} prefectures')
        )
