from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from .models import DomesticHotWaterSystem
from .serializer import DomesticHotWaterSystemSerializer
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

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_domestic_hot_water_system(request):
    try:
        data = request.data
        
        if not data.get("building"):
            return standard_error_response("Building is required", status.HTTP_400_BAD_REQUEST)
        
        if not validate_uuid(data.get("building")):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            building = Building.objects.get(uuid=data.get("building"))
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
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
        
        domestic_hot_water_system = DomesticHotWaterSystem.objects.create(
            building=building,
            project=project,
            user=request.user,
            heating_system_type=data.get("heating_system_type"),
            boiler_type=data.get("boiler_type"),
            power_kw=data.get("power_kw"),
            thermal_efficiency=data.get("thermal_efficiency"),
            distribution_network_state=data.get("distribution_network_state"),
            storage_tank_state=data.get("storage_tank_state"),
            energy_metering_system=data.get("energy_metering_system")
        )
        
        serializer = DomesticHotWaterSystemSerializer(domestic_hot_water_system)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_domestic_hot_water_systems(request, building_uuid):
    try:
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            building = Building.objects.get(uuid=building_uuid)
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not have permission to view systems for this building", status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            domestic_hot_water_systems = DomesticHotWaterSystem.objects.filter(building=building)
        else:
            domestic_hot_water_systems = DomesticHotWaterSystem.objects.filter(building=building, user=request.user)
        
        serializer = DomesticHotWaterSystemSerializer(domestic_hot_water_systems, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_domestic_hot_water_system(request, system_uuid):
    try:
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            domestic_hot_water_system = DomesticHotWaterSystem.objects.get(uuid=system_uuid)
        except DomesticHotWaterSystem.DoesNotExist:
            return standard_error_response("Domestic hot water system not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, domestic_hot_water_system):
            return standard_error_response("Access denied: You do not have permission to update this system", status.HTTP_403_FORBIDDEN)
        
        serializer = DomesticHotWaterSystemSerializer(
            domestic_hot_water_system, 
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
def delete_domestic_hot_water_system(request, system_uuid):
    try:
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            domestic_hot_water_system = DomesticHotWaterSystem.objects.get(uuid=system_uuid)
        except DomesticHotWaterSystem.DoesNotExist:
            return standard_error_response("Domestic hot water system not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, domestic_hot_water_system):
            return standard_error_response("Access denied: You do not have permission to delete this system", status.HTTP_403_FORBIDDEN)
        
        domestic_hot_water_system.delete()
        return standard_success_response("Domestic hot water system deleted successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
