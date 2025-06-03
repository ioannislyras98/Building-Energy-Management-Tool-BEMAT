from rest_framework import serializers
from .models import BoilerDetail

class BoilerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoilerDetail
        fields = '__all__' 