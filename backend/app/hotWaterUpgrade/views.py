from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import logging

from common.utils import is_admin_user, has_access_permission
from .models import HotWaterUpgrade
from .serializer import HotWaterUpgradeSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_hot_water_upgrade(request):
    """Create a new hot water upgrade system entry"""
    try:
        building_uuid = request.data.get('building')
        if building_uuid:
            existing = HotWaterUpgrade.objects.filter(building=building_uuid).first()
            if existing:
                serializer = HotWaterUpgradeSerializer(existing, data=request.data, partial=True)
            else:
                serializer = HotWaterUpgradeSerializer(data=request.data)
        else:
            serializer = HotWaterUpgradeSerializer(data=request.data)
        
        if serializer.is_valid():
            hot_water_upgrade = serializer.save()
            return Response({
                'success': True,
                'message': 'Hot water upgrade data saved successfully',
                'data': HotWaterUpgradeSerializer(hot_water_upgrade).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_hot_water_upgrade_by_building(request, building_uuid):
    """Get hot water upgrade data for a specific building"""
    try:
        hot_water_upgrades = HotWaterUpgrade.objects.filter(building=building_uuid).order_by('-created_at')
        
        if hot_water_upgrades.exists():
            serializer = HotWaterUpgradeSerializer(hot_water_upgrades, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'No hot water upgrade data found for this building'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_hot_water_upgrade_detail(request, pk):
    """Get detailed hot water upgrade data by ID"""
    try:
        hot_water_upgrade = get_object_or_404(HotWaterUpgrade, pk=pk)
        serializer = HotWaterUpgradeSerializer(hot_water_upgrade)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_hot_water_upgrade(request, pk):
    """Update hot water upgrade data"""
    try:
        hot_water_upgrade = get_object_or_404(HotWaterUpgrade, pk=pk)
        serializer = HotWaterUpgradeSerializer(hot_water_upgrade, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_hot_water_upgrade = serializer.save()
            return Response({
                'success': True,
                'message': 'Hot water upgrade data updated successfully',
                'data': HotWaterUpgradeSerializer(updated_hot_water_upgrade).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_hot_water_upgrade(request, pk):
    """Delete hot water upgrade data"""
    try:
        hot_water_upgrade = get_object_or_404(HotWaterUpgrade, pk=pk)
        hot_water_upgrade.delete()
        
        return Response({
            'success': True,
            'message': 'Hot water upgrade data deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
