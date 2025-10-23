from rest_framework import serializers
from .models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['uuid', 'name', 'role', 'email', 'phone_number', 'building', 'created_at', 'updated_at']
        read_only_fields = ['uuid', 'created_at', 'updated_at', 'building'] 

class ContactCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['name', 'role', 'email', 'phone_number'] 