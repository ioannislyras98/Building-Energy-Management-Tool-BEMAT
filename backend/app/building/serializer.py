from rest_framework import serializers
from .models import Building
from prefectures.serializers import PrefectureListSerializer

class BuildingSerializer(serializers.ModelSerializer):
    prefecture_data = PrefectureListSerializer(source='prefecture', read_only=True)
    
    class Meta:
        model = Building
        fields = '__all__'