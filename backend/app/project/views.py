import json
import logging
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from .models import Project
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializer import ProjectSerializer

logger = logging.getLogger(__name__)

def get_user_from_token(token):
    try:
        token_obj = Token.objects.get(key=token)
        return token_obj.user
    except Token.DoesNotExist:
        return None

@csrf_exempt
def create_project(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    # Έλεγχος για το token στο header
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return JsonResponse({"error": "Authorization token required"}, status=401)
    try:
        token = auth_header.split()[1]
    except IndexError:
        return JsonResponse({"error": "Invalid Authorization header format"}, status=401)
    user = get_user_from_token(token)
    if not user:
        return JsonResponse({"error": "Invalid or expired token"}, status=401)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    # Ορισμός των required πεδίων
    required_fields = ["name", "cost_per_kwh_fuel", "cost_per_kwh_electricity"]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return JsonResponse({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }, status=400)
    try:
        project = Project.objects.create(
            name=data.get("name"),
            cost_per_kwh_fuel=data.get("cost_per_kwh_fuel"),
            cost_per_kwh_electricity=data.get("cost_per_kwh_electricity"),
            user=user
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({
        "uuid": project.uuid,
        "name": project.name,
        "User": project.user.email,
        "message": "Project created successfully"
    }, status=201)

@csrf_exempt
def delete_project(request, uuid): # Changed from project_uuid to uuid
    if request.method != "DELETE":
        return HttpResponseNotAllowed(["DELETE"])
    
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return JsonResponse({"error": "Authorization token required"}, status=401)
    try:
        token = auth_header.split()[1]
    except IndexError:
        return JsonResponse({"error": "Invalid Authorization header format"}, status=401)
    
    user = get_user_from_token(token)
    if not user:
        return JsonResponse({"error": "Invalid or expired token"}, status=401)
    
    try:
        project = Project.objects.get(uuid=uuid, user=user) # Changed from project_uuid
        project_name_for_log = project.name  # Get name before deletion for logging
        project.delete()
        logger.info(f"Project '{project_name_for_log}' ({uuid}) and its buildings deleted successfully by user {user.email}.") # Changed from project_uuid
        return JsonResponse({"message": "Project and its buildings deleted successfully"}, status=200)
    except Project.DoesNotExist:
        logger.warning(f"Project with UUID {uuid} not found for deletion by user {user.email if user else 'unknown'}.") # Changed from project_uuid
        return JsonResponse({"error": "Project not found or access denied"}, status=404)
    except Exception as e:
        logger.error(
            f"Error during deletion of project {uuid} by user {user.email if user else 'unknown'}. Error: {str(e)}", # Changed from project_uuid
            exc_info=True
        )
        return JsonResponse({"error": f"An unexpected error occurred during project deletion: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def get_projects(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return JsonResponse({"error": "Authorization token required"}, status=401)
    try:
        token = auth_header.split()[1]
    except IndexError:
        return JsonResponse({"error": "Invalid Authorization header format"}, status=401)
    user = get_user_from_token(token)
    if not user:
        return JsonResponse({"error": "Invalid or expired token"}, status=401)
    
    projects = Project.objects.filter(user=user)
    projects_list = [{
        "uuid": project.uuid,
        "name": project.name,
        "date_created": project.date_created.strftime("%d-%m-%Y"),
        "buildings_count": project.buildings_count,
        "cost_per_kwh_fuel": str(project.cost_per_kwh_fuel),
        "cost_per_kwh_electricity": str(project.cost_per_kwh_electricity)
    } for project in projects]
    
    return JsonResponse({"projects": projects_list}, status=200)

@csrf_exempt
def get_project_detail(request, project_uuid):
    """
    Endpoint για την ανάκτηση λεπτομερειών ενός συγκεκριμένου έργου.
    """
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return JsonResponse({"error": "Authorization token required"}, status=401)
    try:
        token = auth_header.split()[1]
    except IndexError:
        return JsonResponse({"error": "Invalid Authorization header format"}, status=401)
    
    user = get_user_from_token(token)
    if not user:
        return JsonResponse({"error": "Invalid or expired token"}, status=401)
    
    try:
        project = Project.objects.get(uuid=project_uuid)
        
        # Έλεγχος αν ο authenticated χρήστης έχει δικαίωμα πρόσβασης στο έργο
        if project.user != user:
            return JsonResponse({"error": "Access denied: You do not own this project"}, status=403)
        
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
        
        return JsonResponse(project_data, status=200)
    
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

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