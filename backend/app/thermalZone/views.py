from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from .models import ThermalZone
from .serializer import ThermalZoneSerializer
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
def create_thermal_zone(request):
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
        
        thermal_zone = ThermalZone.objects.create(
            building=building,
            project=project,
            user=request.user,
            thermal_zone_usage=data.get("thermal_zone_usage"),
            description=data.get("description"),
            space_condition=data.get("space_condition"),
            floor=data.get("floor"),
            total_thermal_zone_area=data.get("total_thermal_zone_area")
        )
        
        serializer = ThermalZoneSerializer(thermal_zone)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_thermal_zones(request, building_uuid):
    try:
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            building = Building.objects.get(uuid=building_uuid)
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not have permission to view thermal zones for this building", status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            thermal_zones = ThermalZone.objects.filter(building=building)
        else:
            thermal_zones = ThermalZone.objects.filter(
                building=building, 
                user=request.user
            )
        
        serializer = ThermalZoneSerializer(thermal_zones, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_thermal_zone(request, zone_uuid):
    try:
        if not validate_uuid(zone_uuid):
            return standard_error_response("Invalid thermal zone UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            thermal_zone = ThermalZone.objects.get(uuid=zone_uuid)
        except ThermalZone.DoesNotExist:
            return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, thermal_zone):
            return standard_error_response("Access denied: You do not own this thermal zone", status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        if "thermal_zone_usage" in data:
            thermal_zone.thermal_zone_usage = data.get("thermal_zone_usage")
        if "description" in data:
            thermal_zone.description = data.get("description")
        if "space_condition" in data:
            thermal_zone.space_condition = data.get("space_condition")
        if "floor" in data:
            thermal_zone.floor = data.get("floor")
        if "total_thermal_zone_area" in data:
            thermal_zone.total_thermal_zone_area = data.get("total_thermal_zone_area")
        
        thermal_zone.save()
        
        serializer = ThermalZoneSerializer(thermal_zone)
        return standard_success_response(serializer.data, "Thermal zone updated successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_thermal_zone(request, zone_uuid):
    try:
        if not validate_uuid(zone_uuid):
            return standard_error_response("Invalid thermal zone UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            thermal_zone = ThermalZone.objects.get(uuid=zone_uuid)
        except ThermalZone.DoesNotExist:
            return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, thermal_zone):
            return standard_error_response("Access denied: You do not own this thermal zone", status.HTTP_403_FORBIDDEN)
        
        thermal_zone.delete()
        return standard_success_response(None, "Thermal zone deleted successfully", status.HTTP_204_NO_CONTENT)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
