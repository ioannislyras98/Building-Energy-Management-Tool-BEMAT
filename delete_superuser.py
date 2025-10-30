import sys
import os

sys.path.insert(0, 'backend/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Εμφάνισε όλους τους superusers
print("Current superusers:")
superusers = User.objects.filter(is_superuser=True)
for i, user in enumerate(superusers, 1):
    print(f"{i}. {user.email} (UUID: {user.uuid})")

# Ρώτα ποιον θέλει να διαγράψει
print("\nEnter the email of the superuser to delete (or 'cancel' to exit):")
email = input().strip()

if email.lower() == 'cancel':
    print("Cancelled.")
else:
    try:
        user = User.objects.get(email=email, is_superuser=True)
        print(f"\nAre you sure you want to delete superuser '{user.email}'? (yes/no)")
        confirm = input().strip().lower()
        
        if confirm == 'yes':
            user.delete()
            print(f"✓ Superuser '{email}' deleted successfully!")
        else:
            print("Cancelled.")
    except User.DoesNotExist:
        print(f"Error: No superuser found with email '{email}'")
