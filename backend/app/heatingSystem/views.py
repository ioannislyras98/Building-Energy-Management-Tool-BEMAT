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
    """
    Create a new heating system for a building.
    """
    user = request.user
    data = request.data
    
    # Validate required fields
    required_fields = ["building"]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        error_data, status_code = standard_error_response(
            f"Missing required fields: {', '.join(missing_fields)}"
        )
        return Response(error_data, status=status_code)
    
    # Validate building
    building_uuid = validate_uuid(data.get("building"))
    if not building_uuid:
        error_data, status_code = standard_error_response("Invalid building UUID")
        return Response(error_data, status=status_code)
    
    try:
        building = Building.objects.get(uuid=building_uuid)
    except Building.DoesNotExist:
        error_data, status_code = standard_error_response("Building not found", 404)
        return Response(error_data, status=status_code)
    
    # Check ownership
    if not check_user_ownership(user, building):
        return standard_error_response("You don't have permission to add heating systems to this building", 403)
    
    # Validate project if provided
    project = None
    if data.get("project"):
        project_uuid = validate_uuid(data.get("project"))
        if not project_uuid:
            error_data, status_code = standard_error_response("Invalid project UUID")
            return Response(error_data, status=status_code)
        
        try:
            project = Project.objects.get(uuid=project_uuid)
            if not check_user_ownership(user, project):
                return standard_error_response("You don't have permission to use this project", 403)
        except Project.DoesNotExist:
            return standard_error_response("Project not found", 404)
    
    # Create heating system using serializer
    serializer_data = data.copy()
    serializer_data['building'] = building.uuid
    serializer_data['user'] = user.uuid
    if project:
        serializer_data['project'] = project.uuid
    
    serializer = HeatingSystemSerializer(data=serializer_data)
    if serializer.is_valid():
        heating_system = serializer.save()
        return standard_success_response(
            serializer.data, 
            "Heating system created successfully", 
            201
        )
    else:
        error_data, status_code = standard_error_response(
            f"Validation errors: {serializer.errors}"
        )
        return Response(error_data, status=status_code)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_heating_systems(request, building_uuid):
    """
    Get all heating systems for a specific building.
    """
    user = request.user
    
    # Validate UUID
    building_uuid = validate_uuid(building_uuid)
    if not building_uuid:
        error_data, status_code = standard_error_response("Invalid building UUID")
        return Response(error_data, status=status_code)
    
    try:
        building = Building.objects.get(uuid=building_uuid)
    except Building.DoesNotExist:
        error_data, status_code = standard_error_response("Building not found", 404)
        return Response(error_data, status=status_code)
    
    # Check ownership
    if not check_user_ownership(user, building):
        return standard_error_response("You don't have permission to view heating systems for this building", 403)
    
    # Get heating systems
    heating_systems = HeatingSystem.objects.filter(building=building, user=user)
    serializer = HeatingSystemSerializer(heating_systems, many=True)
    
    return standard_success_response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_heating_system(request, system_uuid):
    """
    Endpoint για την ενημέρωση των λεπτομερειών συστήματος ζέστης.
    """
    try:
        heating_system = HeatingSystem.objects.get(uuid=system_uuid)
        
        # Check if the user has permission to update this heating system
        if heating_system.user != request.user:
            return Response(
                {"error": "You don't have permission to update this heating system"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = HeatingSystemSerializer(heating_system, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except HeatingSystem.DoesNotExist:
        return Response(
            {"error": "heating system not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_heating_system(request, system_uuid):
    """
    Delete a heating system.
    """
    user = request.user
    
    # Validate UUID
    system_uuid = validate_uuid(system_uuid)
    if not system_uuid:
        error_data, status_code = standard_error_response("Invalid heating system UUID")
        return Response(error_data, status=status_code)
    
    try:
        heating_system = HeatingSystem.objects.get(uuid=system_uuid)
    except HeatingSystem.DoesNotExist:
        error_data, status_code = standard_error_response("Heating system not found", 404)
        return Response(error_data, status=status_code)
    
    # Check ownership
    if not check_user_ownership(user, heating_system):
        return standard_error_response("You don't have permission to delete this heating system", 403)
    
    heating_system.delete()
    
    return standard_success_response(
        None, 
        "Heating system deleted successfully",
        204
    )
