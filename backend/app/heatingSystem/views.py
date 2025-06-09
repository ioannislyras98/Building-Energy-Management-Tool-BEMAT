from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import HeatingSystem
from .serializer import HeatingSystemSerializer
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
def create_heating_system(request):
    try:
        data = request.data
        print(f"Received data: {data}")  # Debug log
        print(f"User: {request.user}")   # Debug log
        
        # Validate required fields
        if not data.get("building"):
            return standard_error_response("Building is required", status.HTTP_400_BAD_REQUEST)
        
        if not data.get("project"):
            return standard_error_response("Project is required", status.HTTP_400_BAD_REQUEST)
        
        # Validate building UUID
        if not validate_uuid(data.get("building")):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        # Validate project UUID
        if not validate_uuid(data.get("project")):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check building exists and user has permission
        try:
            building = Building.objects.get(uuid=data.get("building"))
            print(f"Found building: {building}, owner: {building.user}")  # Debug log
        except Building.DoesNotExist:
            print(f"Building with UUID {data.get('building')} not found")  # Debug log
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        # Check project exists and user has permission
        try:
            project = Project.objects.get(uuid=data.get("project"))
            if not check_user_ownership(request.user, project):
                return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
        except Project.DoesNotExist:
            return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        # Create heating system
        heating_system = HeatingSystem.objects.create(
            building=building,
            project=project,
            user=request.user,
            heating_system_type=data.get("heating_system_type"),
            exchanger_type=data.get("exchanger_type"),
            central_boiler_system=data.get("central_boiler_system"),
            central_heat_pump_system=data.get("central_heat_pump_system"),
            local_heating_system=data.get("local_heating_system"),
            power_kw=data.get("power_kw"),
            construction_year=data.get("construction_year"),
            cop=data.get("cop"),
            distribution_network_state=data.get("distribution_network_state")
        )
        
        serializer = HeatingSystemSerializer(heating_system)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_heating_systems(request, building_uuid):
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
            return standard_error_response("Access denied: You do not have permission to view systems for this building", status.HTTP_403_FORBIDDEN)
        
        # Get heating systems for building
        heating_systems = HeatingSystem.objects.filter(
            building=building, 
            user=request.user
        )
        
        serializer = HeatingSystemSerializer(heating_systems, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_heating_system(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get heating system
        try:
            heating_system = HeatingSystem.objects.get(uuid=system_uuid)
        except HeatingSystem.DoesNotExist:
            return standard_error_response("Heating system not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, heating_system):
            return standard_error_response("Access denied: You do not have permission to update this system", status.HTTP_403_FORBIDDEN)
        
        # Update system
        serializer = HeatingSystemSerializer(
            heating_system, 
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
def delete_heating_system(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get heating system
        try:
            heating_system = HeatingSystem.objects.get(uuid=system_uuid)
        except HeatingSystem.DoesNotExist:
            return standard_error_response("Heating system not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, heating_system):
            return standard_error_response("Access denied: You do not have permission to delete this system", status.HTTP_403_FORBIDDEN)
        
        # Delete system
        heating_system.delete()
        return standard_success_response("Heating system deleted successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
