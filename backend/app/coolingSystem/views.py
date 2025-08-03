from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CoolingSystem
from .serializer import CoolingSystemSerializer
from building.models import Building
from project.models import Project
from common.utils import (
    get_user_from_token, 
    standard_error_response, 
    standard_success_response,
    validate_uuid,
    check_user_ownership,
    is_admin_user,
    has_access_permission
)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_cooling_system(request):
    try:
        data = request.data
        
        # Validate required fields
        if not data.get("building"):
            return standard_error_response("Building is required", status.HTTP_400_BAD_REQUEST)
        
        # Validate building UUID
        if not validate_uuid(data.get("building")):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check building exists and user has permission
        try:
            building = Building.objects.get(uuid=data.get("building"))
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        # Check project exists and user has permission (if provided)
        project = None
        if data.get("project"):
            if not validate_uuid(data.get("project")):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
            try:
                project = Project.objects.get(uuid=data.get("project"))
                if not has_access_permission(request.user, project):
                    return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
            except Project.DoesNotExist:
                return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        # Create cooling system
        cooling_system = CoolingSystem.objects.create(
            building=building,
            project=project,
            user=request.user,
            cooling_system_type=data.get("cooling_system_type"),
            cooling_unit_accessibility=data.get("cooling_unit_accessibility"),
            heat_pump_type=data.get("heat_pump_type"),
            power_kw=data.get("power_kw"),
            construction_year=data.get("construction_year"),
            energy_efficiency_ratio=data.get("energy_efficiency_ratio"),
            maintenance_period=data.get("maintenance_period"),
            operating_hours=data.get("operating_hours")
        )
        
        serializer = CoolingSystemSerializer(cooling_system)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_cooling_systems(request, building_uuid):
    try:
        # Validate building UUID
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check building exists and user has permission
        try:
            building = Building.objects.get(uuid=building_uuid)
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not have permission to view systems for this building", status.HTTP_403_FORBIDDEN)
        
        # Get cooling systems for building - Admin users see all, regular users see only their own
        if is_admin_user(request.user):
            cooling_systems = CoolingSystem.objects.filter(building=building)
        else:
            cooling_systems = CoolingSystem.objects.filter(building=building, user=request.user)
        
        serializer = CoolingSystemSerializer(cooling_systems, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cooling_system(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get cooling system
        try:
            cooling_system = CoolingSystem.objects.get(uuid=system_uuid)
        except CoolingSystem.DoesNotExist:
            return standard_error_response("Cooling system not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not has_access_permission(request.user, cooling_system):
            return standard_error_response("Access denied: You do not have permission to update this system", status.HTTP_403_FORBIDDEN)
        
        # Update system
        serializer = CoolingSystemSerializer(
            cooling_system, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cooling_system(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get cooling system
        try:
            cooling_system = CoolingSystem.objects.get(uuid=system_uuid)
        except CoolingSystem.DoesNotExist:
            return standard_error_response("Cooling system not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not has_access_permission(request.user, cooling_system):
            return standard_error_response("Access denied: You do not have permission to delete this system", status.HTTP_403_FORBIDDEN)
        
        # Delete system
        cooling_system.delete()
        return standard_success_response("Cooling system deleted successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)