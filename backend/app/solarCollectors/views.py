import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import SolarCollector
from .serializer import SolarCollectorSerializer
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
def create_solar_collector(request):
    """
    Create a new solar collector for a building.
    """
    user = request.user
    data = request.data
    
    # Validate required fields
    required_fields = ["building"]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return standard_error_response(
            f"Missing required fields: {', '.join(missing_fields)}"
        )
    
    # Validate building
    if not validate_uuid(data.get("building")):
        return standard_error_response("Invalid building UUID")
    
    try:
        building = Building.objects.get(uuid=data.get("building"))
    except Building.DoesNotExist:
        return standard_error_response("Building not found", 404)
    
    # Check ownership
    if not check_user_ownership(user, building):
        return standard_error_response("You don't have permission to add solar collectors to this building", 403)
    
    # Validate project if provided
    project = None
    if data.get("project"):
        if not validate_uuid(data.get("project")):
            return standard_error_response("Invalid project UUID")
        
        try:
            project = Project.objects.get(uuid=data.get("project"))
            if not check_user_ownership(user, project):
                return standard_error_response("You don't have permission to use this project", 403)
        except Project.DoesNotExist:
            return standard_error_response("Project not found", 404)
    
    # Create solar collector using serializer
    serializer_data = data.copy()
    serializer_data['building'] = building.uuid
    serializer_data['user'] = user.uuid
    if project:
        serializer_data['project'] = project.uuid
    
    serializer = SolarCollectorSerializer(data=serializer_data)
    if serializer.is_valid():
        solar_collector = serializer.save()
        return standard_success_response(
            serializer.data, 
            "Solar collector created successfully", 
            201
        )
    else:
        return standard_error_response(
            f"Validation errors: {serializer.errors}"
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_solar_collectors(request, building_uuid):
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
        
        # Get solar collectors for building
        solar_collectors = SolarCollector.objects.filter(
            building=building, 
            user=request.user
        )
        
        serializer = SolarCollectorSerializer(solar_collectors, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_solar_collector(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get solar collector
        try:
            solar_collector = SolarCollector.objects.get(uuid=system_uuid)
        except SolarCollector.DoesNotExist:
            return standard_error_response("Solar collector not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, solar_collector):
            return standard_error_response("Access denied: You do not have permission to update this system", status.HTTP_403_FORBIDDEN)
        
        # Update system
        serializer = SolarCollectorSerializer(
            solar_collector, 
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
def delete_solar_collector(request, system_uuid):
    try:
        # Validate system UUID
        if not validate_uuid(system_uuid):
            return standard_error_response("Invalid system UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get solar collector
        try:
            solar_collector = SolarCollector.objects.get(uuid=system_uuid)
        except SolarCollector.DoesNotExist:
            return standard_error_response("Solar collector not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, solar_collector):
            return standard_error_response("Access denied: You do not have permission to delete this system", status.HTTP_403_FORBIDDEN)
        
        # Delete system
        solar_collector.delete()
        return standard_success_response("Solar collector deleted successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
