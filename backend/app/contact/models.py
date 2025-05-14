import uuid
from django.db import models
from building.models import Building # Εισαγωγή του μοντέλου Building
from user.models import User # Αν θέλετε να συνδέσετε την επαφή και με τον χρήστη που την δημιούργησε

class Contact(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    building = models.ForeignKey(Building, related_name='contacts', on_delete=models.CASCADE)
    # user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) # Προαιρετικά
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField()
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.building.name}"

    class Meta:
        ordering = ['created_at']
