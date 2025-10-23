from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission
from .models import ExteriorBlinds
from .serializer import ExteriorBlindsSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exterior_blinds_list(request):
    """Λίστα όλων των εξωτερικών περσίδων"""
    exterior_blinds = ExteriorBlinds.objects.all()
    serializer = ExteriorBlindsSerializer(exterior_blinds, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exterior_blinds_by_building(request, building_uuid):
    """Λήψη εξωτερικών περσίδων ανά κτίριο"""
    building = get_object_or_404(Building, uuid=building_uuid)
    
    try:
        exterior_blinds = ExteriorBlinds.objects.get(building=building)
        serializer = ExteriorBlindsSerializer(exterior_blinds)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ExteriorBlinds.DoesNotExist:
        return Response({"detail": "Δεν βρέθηκαν δεδομένα εξωτερικών περσίδων για αυτό το κτίριο"}, 
                      status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exterior_blinds_by_project(request, project_uuid):
    """Λήψη εξωτερικών περσίδων ανά έργο"""
    project = get_object_or_404(Project, uuid=project_uuid)
    exterior_blinds = ExteriorBlinds.objects.filter(project=project)
    serializer = ExteriorBlindsSerializer(exterior_blinds, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def exterior_blinds_detail(request, uuid):
    """Λεπτομέρειες, ενημέρωση και διαγραφή εξωτερικών περσίδων"""
    exterior_blinds = get_object_or_404(ExteriorBlinds, uuid=uuid)
    
    if request.method == 'GET':
        serializer = ExteriorBlindsSerializer(exterior_blinds)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = ExteriorBlindsSerializer(exterior_blinds, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        exterior_blinds.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exterior_blinds_create(request):
    """Δημιουργία νέας εγγραφής εξωτερικών περσίδων ή ενημέρωση υπάρχουσας"""
    building_uuid = request.data.get('building')
    project_uuid = request.data.get('project')
    
    if not building_uuid or not project_uuid:
        return Response(
            {"error": "Τα πεδία building και project είναι υποχρεωτικά"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    building = get_object_or_404(Building, pk=building_uuid)
    project = get_object_or_404(Project, pk=project_uuid)
    
    existing = ExteriorBlinds.objects.filter(building=building, project=project).first()
    
    if existing:
        serializer = ExteriorBlindsSerializer(existing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(building=building, project=project)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        serializer = ExteriorBlindsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(building=building, project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
