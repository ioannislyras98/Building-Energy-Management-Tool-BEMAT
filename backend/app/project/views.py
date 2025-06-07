import logging
from .models import Project
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializer import ProjectSerializer
from common.utils import (
    get_user_from_token, 
    standard_error_response, 
    standard_success_response,
    validate_uuid,
    check_user_ownership
)

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):
    try:
        data = request.data
        
        # Ορισμός των required πεδίων
        required_fields = ["name", "cost_per_kwh_fuel", "cost_per_kwh_electricity"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return standard_error_response(
                f"Missing required fields: {', '.join(missing_fields)}", 
                status.HTTP_400_BAD_REQUEST
            )
        
        project = Project.objects.create(
            name=data.get("name"),
            cost_per_kwh_fuel=data.get("cost_per_kwh_fuel"),
            cost_per_kwh_electricity=data.get("cost_per_kwh_electricity"),
            user=request.user
        )
    
        return Response({
            "uuid": project.uuid,
            "name": project.name,
            "User": project.user.email,
            "message": "Project created successfully"
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_project(request, uuid):
    try:
        if not validate_uuid(uuid):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
        project = Project.objects.get(uuid=uuid, user=request.user)
        project_name_for_log = project.name
        project.delete()
        
        logger.info(f"Project '{project_name_for_log}' ({uuid}) and its buildings deleted successfully by user {request.user.email}.")
        return standard_success_response({"message": "Project and its buildings deleted successfully"})
        
    except Project.DoesNotExist:
        logger.warning(f"Project with UUID {uuid} not found for deletion by user {request.user.email}.")
        return standard_error_response("Project not found or access denied", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error during deletion of project {uuid} by user {request.user.email}. Error: {str(e)}", exc_info=True)
        return standard_error_response(f"An unexpected error occurred during project deletion: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):
    try:
        projects = Project.objects.filter(user=request.user)
        projects_list = [{
            "uuid": project.uuid,
            "name": project.name,
            "date_created": project.date_created.strftime("%d-%m-%Y"),
            "buildings_count": project.buildings_count,
            "cost_per_kwh_fuel": str(project.cost_per_kwh_fuel),
            "cost_per_kwh_electricity": str(project.cost_per_kwh_electricity)
        } for project in projects]
        
        return standard_success_response({"projects": projects_list})
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_detail(request, project_uuid):
    """
    Endpoint για την ανάκτηση λεπτομερειών ενός συγκεκριμένου έργου.
    """
    try:
        if not validate_uuid(project_uuid):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
        project = Project.objects.get(uuid=project_uuid)
        
        # Έλεγχος αν ο authenticated χρήστης έχει δικαίωμα πρόσβασης στο έργο
        if not check_user_ownership(request.user, project):
            return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
        
        # Επιστρέφουμε αναλυτικά όλα τα πεδία του έργου
        project_data = {
            "uuid": str(project.uuid),
            "name": project.name,
            "user": str(project.user.email),
            "buildings_count": project.buildings_count,
            "cost_per_kwh_fuel": str(project.cost_per_kwh_fuel) if project.cost_per_kwh_fuel else None,
            "cost_per_kwh_electricity": str(project.cost_per_kwh_electricity) if project.cost_per_kwh_electricity else None,
            "date_created": project.date_created.strftime("%d-%m-%Y"),
        }
        
        return standard_success_response(project_data)
    
    except Project.DoesNotExist:
        return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_project(request, uuid):
    """
    Endpoint για την ενημέρωση ενός project.
    """
    try:
        # Βρίσκουμε το project με το συγκεκριμένο UUID
        project = Project.objects.get(uuid=uuid)
        
        # Ελέγχουμε αν ο χρήστης έχει δικαίωμα να ενημερώσει αυτό το project
        if project.user != request.user:
            return Response(
                {"error": "You don't have permission to update this project"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ενημερώνουμε το project με τα νέα δεδομένα
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except Project.DoesNotExist:
        return Response(
            {"error": "Project not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )