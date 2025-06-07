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
    has_permission, error_msg = check_user_ownership(
        building, user, "You don't have permission to add solar collectors to this building"
    )
    if not has_permission:
        error_data, status_code = standard_error_response(error_msg, 403)
        return Response(error_data, status=status_code)
    
    # Validate project if provided
    project = None
    if data.get("project"):
        project_uuid = validate_uuid(data.get("project"))
        if not project_uuid:
            error_data, status_code = standard_error_response("Invalid project UUID")
            return Response(error_data, status=status_code)
        
        try:
            project = Project.objects.get(uuid=project_uuid)
            has_permission, error_msg = check_user_ownership(
                project, user, "You don't have permission to use this project"
            )
            if not has_permission:
                error_data, status_code = standard_error_response(error_msg, 403)
                return Response(error_data, status=status_code)
        except Project.DoesNotExist:
            error_data, status_code = standard_error_response("Project not found", 404)
            return Response(error_data, status=status_code)
    
    # Create solar collector using serializer
    serializer_data = data.copy()
    serializer_data['building'] = building.uuid
    serializer_data['user'] = user.uuid
    if project:
        serializer_data['project'] = project.uuid
    
    serializer = SolarCollectorSerializer(data=serializer_data)
    if serializer.is_valid():
        solar_collector = serializer.save()
        response_data, status_code = standard_success_response(
            serializer.data, 
            "Solar collector created successfully", 
            201
        )
        return Response(response_data, status=status_code)
    else:
        error_data, status_code = standard_error_response(
            f"Validation errors: {serializer.errors}"
        )
        return Response(error_data, status=status_code)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_solar_collectors(request, building_uuid):
    """
    Get all solar collectors for a specific building.
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
    has_permission, error_msg = check_user_ownership(
        building, user, "You don't have permission to view solar collectors for this building"
    )
    if not has_permission:
        error_data, status_code = standard_error_response(error_msg, 403)
        return Response(error_data, status=status_code)
    
    # Get solar collectors
    solar_collectors = SolarCollector.objects.filter(building=building, user=user)
    serializer = SolarCollectorSerializer(solar_collectors, many=True)
    
    response_data, status_code = standard_success_response(serializer.data)
    return Response(response_data, status=status_code)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_solar_collector(request, system_uuid):
    """
    Endpoint για την ενημέρωση των λεπτομερειών ηλιακών συλλεκτών.
    """
    try:
        system_uuid = uuid.UUID(system_uuid)
        solar_collector = SolarCollector.objects.get(uuid=system_uuid)
        
        # Check if the user has permission to update this solar collector
        if solar_collector.user != request.user:
            return Response(
                {"error": "You don't have permission to update this solar collector"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SolarCollectorSerializer(solar_collector, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except SolarCollector.DoesNotExist:
        return Response(
            {"error": "Solar collector not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_solar_collector(request, system_uuid):
    """
    Delete a solar collector.
    """
    user = request.user
    
    # Validate UUID
    system_uuid = validate_uuid(system_uuid)
    if not system_uuid:
        error_data, status_code = standard_error_response("Invalid solar collector UUID")
        return Response(error_data, status=status_code)
    
    try:
        solar_collector = SolarCollector.objects.get(uuid=system_uuid)
    except SolarCollector.DoesNotExist:
        error_data, status_code = standard_error_response("Solar collector not found", 404)
        return Response(error_data, status=status_code)
    
    # Check ownership
    has_permission, error_msg = check_user_ownership(
        solar_collector, user, "You don't have permission to delete this solar collector"
    )
    if not has_permission:
        error_data, status_code = standard_error_response(error_msg, 403)
        return Response(error_data, status=status_code)
    
    solar_collector.delete()
    
    response_data, status_code = standard_success_response(
        None, 
        "Solar collector deleted successfully",
        204
    )
    return Response(response_data, status=status_code)
