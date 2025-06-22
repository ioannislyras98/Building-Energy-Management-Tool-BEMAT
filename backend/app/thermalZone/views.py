from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import ThermalZone
from .serializer import ThermalZoneSerializer
from building.models import Building
from project.models import Project
from common.utils import (
    get_user_from_token, 
    standard_error_response, 
    standard_success_response,
    validate_uuid,
    check_user_ownership
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_thermal_zone(request):
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
        
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        # Check project exists and user has permission (if provided)
        project = None
        if data.get("project"):
            if not validate_uuid(data.get("project")):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
            try:
                project = Project.objects.get(uuid=data.get("project"))
                if not check_user_ownership(request.user, project):
                    return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
            except Project.DoesNotExist:
                return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        # Create thermal zone
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
        # Validate building UUID
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check building exists and user has permission
        try:
            building = Building.objects.get(uuid=building_uuid)
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not have permission to view thermal zones for this building", status.HTTP_403_FORBIDDEN)
        
        # Get thermal zones for building
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
        # Validate zone UUID
        if not validate_uuid(zone_uuid):
            return standard_error_response("Invalid thermal zone UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check thermal zone exists and user has permission
        try:
            thermal_zone = ThermalZone.objects.get(uuid=zone_uuid)
        except ThermalZone.DoesNotExist:
            return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, thermal_zone):
            return standard_error_response("Access denied: You do not own this thermal zone", status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        # Update thermal zone fields
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
        # Validate zone UUID
        if not validate_uuid(zone_uuid):
            return standard_error_response("Invalid thermal zone UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check thermal zone exists and user has permission
        try:
            thermal_zone = ThermalZone.objects.get(uuid=zone_uuid)
        except ThermalZone.DoesNotExist:
            return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, thermal_zone):
            return standard_error_response("Access denied: You do not own this thermal zone", status.HTTP_403_FORBIDDEN)
        
        thermal_zone.delete()
        return standard_success_response(None, "Thermal zone deleted successfully", status.HTTP_204_NO_CONTENT)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
