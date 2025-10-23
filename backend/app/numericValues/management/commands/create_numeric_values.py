from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from numericValues.models import NumericValue


class Command(BaseCommand):
    help = 'Populate the numeric values table with initial data'

    def handle(self, *args, **options):
        User = get_user_model()
        
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.first()
            
        if not admin_user:
            self.stdout.write(
                self.style.ERROR("No user found to assign as creator of numeric values")
            )
            return

        numeric_value_data = [
            {
                'name': 'Εσωτερική Οροφής (Rsi)',
                'value': 0.10,
                'created_by': admin_user
            },
            {
                'name': 'Εσωτερική Τοίχου (Rsi)',
                'value': 0.13,
                'created_by': admin_user
            },
            {
                'name': 'Εξωτερική (Rse)',
                'value': 0.04,
                'created_by': admin_user
            },
        ]

        created_count = 0
        for data in numeric_value_data:
            numeric_value, created = NumericValue.objects.get_or_create(
                name=data['name'],
                defaults={
                    'value': data['value'],
                    'created_by': data['created_by']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created numeric value: {numeric_value.name} = {numeric_value.value}")
            else:
                self.stdout.write(f"Numeric value already exists: {numeric_value.name} = {numeric_value.value}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} numeric values')
        )