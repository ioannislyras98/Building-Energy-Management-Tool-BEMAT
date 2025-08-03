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
    check_user_ownership,
    is_admin_user,
    has_access_permission
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
        # If user is admin, show all projects, otherwise only their own
        if is_admin_user(request.user):
            projects = Project.objects.all()
        else:
            projects = Project.objects.filter(user=request.user)
        
        serializer = ProjectSerializer(projects, many=True)
        return standard_success_response({"projects": serializer.data})
        
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
        
        # Admin users can access any project, regular users only their own
        if not has_access_permission(request.user, project):
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
        if not has_access_permission(request.user, project):
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_project(request, uuid):
    """
    Endpoint for submitting a project.
    Only allows submission if all buildings have completed systems and scenarios.
    """
    try:
        if not validate_uuid(uuid):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
        
        project = Project.objects.get(uuid=uuid)
        
        # Check if user has permission to submit this project
        if not has_access_permission(request.user, project):
            return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
        
        # Check if project can be submitted
        completion_status = project.get_completion_status()
        
        if not completion_status['can_submit']:
            return standard_error_response(
                "Cannot submit project. All buildings must have completed systems and scenarios.",
                status.HTTP_400_BAD_REQUEST
            )
        
        # Submit the project
        project.is_submitted = True
        project.save()
        
        logger.info(f"Project '{project.name}' ({uuid}) submitted successfully by user {request.user.email}.")
        return standard_success_response({
            "message": "Project submitted successfully",
            "project_uuid": str(project.uuid),
            "submission_status": True
        })
        
    except Project.DoesNotExist:
        return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error during submission of project {uuid} by user {request.user.email}. Error: {str(e)}", exc_info=True)
        return standard_error_response(f"An unexpected error occurred during project submission: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_projects_percentage(request):
    """
    Get the percentage of pending (non-submitted) projects for the notification bell.
    """
    try:
        # Get user's projects
        user_projects = Project.objects.filter(user=request.user)
        total_projects = user_projects.count()
        
        if total_projects == 0:
            return standard_success_response({
                "pending_percentage": 0,
                "pending_count": 0,
                "total_count": 0
            })
        
        pending_projects = user_projects.filter(is_submitted=False).count()
        pending_percentage = round((pending_projects / total_projects) * 100, 1)
        
        return standard_success_response({
            "pending_percentage": pending_percentage,
            "pending_count": pending_projects,
            "total_count": total_projects
        })
        
    except Exception as e:
        logger.error(f"Error getting pending projects percentage for user {request.user.email}. Error: {str(e)}", exc_info=True)
        return standard_error_response(f"An unexpected error occurred: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_progress(request, building_uuid):
    """
    Get the progress (systems and scenarios) for a specific building.
    """
    try:
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        from building.models import Building
        building = Building.objects.get(uuid=building_uuid)
        
        # Check if user has permission to access this building
        if not has_access_permission(request.user, building.project):
            return standard_error_response("Access denied: You do not own this building's project", status.HTTP_403_FORBIDDEN)
        
        # Count completed systems (5 systems)
        systems_completed = 0
        if hasattr(building, 'heating_systems') and building.heating_systems.exists():
            systems_completed += 1
        if hasattr(building, 'cooling_systems') and building.cooling_systems.exists():
            systems_completed += 1
        if hasattr(building, 'domestic_hot_water_systems') and building.domestic_hot_water_systems.exists():
            systems_completed += 1
        if hasattr(building, 'electrical_consumptions') and building.electrical_consumptions.exists():
            systems_completed += 1
        if hasattr(building, 'energy_profiles') and building.energy_profiles.exists():
            systems_completed += 1
        
        # Count completed scenarios (11 scenarios)
        scenarios_completed = 0
        # windowReplacement uses default related name
        if hasattr(building, 'windowreplacement_set') and building.windowreplacement_set.exists():
            scenarios_completed += 1
        # bulbReplacement uses default related name  
        if hasattr(building, 'bulbreplacement_set') and building.bulbreplacement_set.exists():
            scenarios_completed += 1
        if hasattr(building, 'boiler_replacements') and building.boiler_replacements.exists():
            scenarios_completed += 1
        # Air conditioning has multiple related names, check any of them
        if (hasattr(building, 'old_air_conditionings') and building.old_air_conditionings.exists()) or \
           (hasattr(building, 'new_air_conditionings') and building.new_air_conditionings.exists()) or \
           (hasattr(building, 'ac_analyses') and building.ac_analyses.exists()):
            scenarios_completed += 1
        if hasattr(building, 'roof_thermal_insulations') and building.roof_thermal_insulations.exists():
            scenarios_completed += 1
        # thermalInsulation uses default related name
        if hasattr(building, 'thermalinsulation_set') and building.thermalinsulation_set.exists():
            scenarios_completed += 1
        if hasattr(building, 'exterior_blinds') and building.exterior_blinds.exists():
            scenarios_completed += 1
        if hasattr(building, 'photovoltaic_systems') and building.photovoltaic_systems.exists():
            scenarios_completed += 1
        if hasattr(building, 'solar_collectors') and building.solar_collectors.exists():
            scenarios_completed += 1
        # hotWaterUpgrade uses default related name
        if hasattr(building, 'hotwaterupgrade_set') and building.hotwaterupgrade_set.exists():
            scenarios_completed += 1
        if hasattr(building, 'automatic_lighting_controls') and building.automatic_lighting_controls.exists():
            scenarios_completed += 1
        
        systems_percentage = round((systems_completed / 5) * 100, 1)
        scenarios_percentage = round((scenarios_completed / 11) * 100, 1)
        
        progress_data = {
            'building_uuid': str(building.uuid),
            'building_name': building.name,
            'systems_completed': systems_completed,
            'systems_total': 5,
            'systems_percentage': systems_percentage,
            'scenarios_completed': scenarios_completed,
            'scenarios_total': 11,
            'scenarios_percentage': scenarios_percentage,
            'is_complete': systems_completed == 5 and scenarios_completed == 11
        }
        
        return standard_success_response(progress_data)
        
    except Building.DoesNotExist:
        return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting building progress for building {building_uuid} by user {request.user.email}. Error: {str(e)}", exc_info=True)
        return standard_error_response(f"An unexpected error occurred: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)