from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import logging

from .models import Prefecture
from .serializers import PrefectureSerializer, PrefectureListSerializer

logger = logging.getLogger(__name__)


class PrefectureListCreateView(generics.ListCreateAPIView):
    queryset = Prefecture.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PrefectureListSerializer
        return PrefectureSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]


class PrefectureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prefecture.objects.all()
    serializer_class = PrefectureSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'uuid'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prefectures_by_zone(request, zone):
    """Get all prefectures for a specific energy zone"""
    prefectures = Prefecture.objects.filter(zone=zone, is_active=True)
    serializer = PrefectureListSerializer(prefectures, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_active_prefectures(request):
    """Get all active prefectures"""
    prefectures = Prefecture.objects.filter(is_active=True)
    serializer = PrefectureListSerializer(prefectures, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_energy_zones(request):
    """Get all available energy zones"""
    zones = [{'value': choice[0], 'label': choice[1]} for choice in Prefecture.ENERGY_ZONE_CHOICES]
    return Response(zones)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_prefectures_admin(request):
    """Get all prefectures (active and inactive) for admin panel"""
    prefectures = Prefecture.objects.all()
    serializer = PrefectureSerializer(prefectures, many=True)
    return Response(serializer.data)
