from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import OldAirConditioning, NewAirConditioning, AirConditioningAnalysis
from .serializer import (
    OldAirConditioningSerializer, NewAirConditioningSerializer, AirConditioningAnalysisSerializer,
    OldAirConditioningCreateSerializer, NewAirConditioningCreateSerializer, AirConditioningAnalysisCreateSerializer
)
from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission


# Old Air Conditioning Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_old_air_conditioning(request):
    """Δημιουργία νέου παλαιού κλιματιστικού"""
    try:
        serializer = OldAirConditioningCreateSerializer(data=request.data)
        if serializer.is_valid():
            old_ac = serializer.save()
            response_serializer = OldAirConditioningSerializer(old_ac)
            return Response({
                'success': True,
                'message': 'Το παλαιό κλιματιστικό προστέθηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_old_air_conditionings_by_building(request, building_uuid):
    """Λήψη όλων των παλαιών κλιματιστικών για συγκεκριμένο κτίριο"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response({
                'success': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            # Admin can see all old air conditionings for the building
            old_acs = OldAirConditioning.objects.filter(building=building).order_by('-created_at')
        else:
            # Regular users can only see their own old air conditionings
            old_acs = OldAirConditioning.objects.filter(building=building, user=request.user).order_by('-created_at')
            
        serializer = OldAirConditioningSerializer(old_acs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_old_air_conditioning(request, ac_uuid):
    """Ενημέρωση παλαιού κλιματιστικού"""
    try:
        old_ac = get_object_or_404(OldAirConditioning, id=ac_uuid)
        serializer = OldAirConditioningCreateSerializer(old_ac, data=request.data, partial=True)
        if serializer.is_valid():
            updated_ac = serializer.save()
            response_serializer = OldAirConditioningSerializer(updated_ac)
            return Response({
                'success': True,
                'message': 'Το παλαιό κλιματιστικό ενημερώθηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_old_air_conditioning(request, ac_uuid):
    """Διαγραφή παλαιού κλιματιστικού"""
    try:
        old_ac = get_object_or_404(OldAirConditioning, id=ac_uuid)
        old_ac.delete()
        return Response({
            'success': True,
            'message': 'Το παλαιό κλιματιστικό διαγράφηκε επιτυχώς'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# New Air Conditioning Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_new_air_conditioning(request):
    """Δημιουργία νέου κλιματιστικού"""
    try:
        serializer = NewAirConditioningCreateSerializer(data=request.data)
        if serializer.is_valid():
            new_ac = serializer.save()
            response_serializer = NewAirConditioningSerializer(new_ac)
            return Response({
                'success': True,
                'message': 'Το νέο κλιματιστικό προστέθηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_new_air_conditionings_by_building(request, building_uuid):
    """Λήψη όλων των νέων κλιματιστικών για συγκεκριμένο κτίριο"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response({
                'success': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            # Admin can see all new air conditionings for the building
            new_acs = NewAirConditioning.objects.filter(building=building).order_by('-created_at')
        else:
            # Regular users can only see their own new air conditionings
            new_acs = NewAirConditioning.objects.filter(building=building, user=request.user).order_by('-created_at')
            
        serializer = NewAirConditioningSerializer(new_acs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_new_air_conditioning(request, ac_uuid):
    """Ενημέρωση νέου κλιματιστικού"""
    try:
        new_ac = get_object_or_404(NewAirConditioning, id=ac_uuid)
        serializer = NewAirConditioningCreateSerializer(new_ac, data=request.data, partial=True)
        if serializer.is_valid():
            updated_ac = serializer.save()
            response_serializer = NewAirConditioningSerializer(updated_ac)
            return Response({
                'success': True,
                'message': 'Το νέο κλιματιστικό ενημερώθηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_new_air_conditioning(request, ac_uuid):
    """Διαγραφή νέου κλιματιστικού"""
    try:
        new_ac = get_object_or_404(NewAirConditioning, id=ac_uuid)
        new_ac.delete()
        return Response({
            'success': True,
            'message': 'Το νέο κλιματιστικό διαγράφηκε επιτυχώς'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Analysis Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_air_conditioning_analysis(request):
    """Δημιουργία ανάλυσης κλιματιστικών"""
    try:
        serializer = AirConditioningAnalysisCreateSerializer(data=request.data)
        if serializer.is_valid():
            analysis = serializer.save()
            response_serializer = AirConditioningAnalysisSerializer(analysis)
            return Response({
                'success': True,
                'message': 'Η ανάλυση αποθηκεύτηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_air_conditioning_analysis_by_building(request, building_uuid):
    """Λήψη ανάλυσης κλιματιστικών για συγκεκριμένο κτίριο"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response({
                'success': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            # Admin can see any analysis for the building
            analysis = AirConditioningAnalysis.objects.filter(building=building).order_by('-created_at').first()
        else:
            # Regular users can only see their own analysis
            analysis = AirConditioningAnalysis.objects.filter(building=building, user=request.user).order_by('-created_at').first()
            
        if analysis:
            serializer = AirConditioningAnalysisSerializer(analysis)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': True,
            'data': None,
            'message': 'Δεν βρέθηκε ανάλυση για αυτό το κτίριο'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_air_conditioning_analysis(request, analysis_uuid):
    """Ενημέρωση ανάλυσης κλιματιστικών"""
    try:
        analysis = get_object_or_404(AirConditioningAnalysis, id=analysis_uuid)
        serializer = AirConditioningAnalysisCreateSerializer(analysis, data=request.data, partial=True)
        if serializer.is_valid():
            updated_analysis = serializer.save()
            response_serializer = AirConditioningAnalysisSerializer(updated_analysis)
            return Response({
                'success': True,
                'message': 'Η ανάλυση ενημερώθηκε επιτυχώς',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'message': 'Σφάλμα στα δεδομένα',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Σφάλμα: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
