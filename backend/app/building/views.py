import json
import logging
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Building
from .serializer import BuildingSerializer
from project.models import Project
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)

def get_user_from_token(token):
    try:
        token_obj = Token.objects.get(key=token)
        return token_obj.user
    except Token.DoesNotExist:
        return None

# Update the create_building function to match new fields
@csrf_exempt
def create_building(request):
    if request.method == "POST":
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
        required_fields = ["name", "usage", "description", "address", "total_area", "examined_area", "floors_examined", "project"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return JsonResponse({field: "This field is required"}, status=400)
        
        # Έλεγχος αν το project υπάρχει
        try:
            project = Project.objects.get(uuid=data.get("project"))
        except Project.DoesNotExist:
            return JsonResponse({"project": "Project not found"}, status=404)
        
        # Έλεγχος αν ο χρήστης έχει δικαίωμα να προσθέσει building στο project
        if project.user != user:
            return JsonResponse({"error": "Access denied: You do not own this project"}, status=403)
        
        try:
            building = Building.objects.create(
                user=user,
                project=project,
                name=data.get("name"),
                usage=data.get("usage"),
                description=data.get("description"),
                year_built=data.get("year_built"),
                address=data.get("address", ""),
                is_insulated=data.get("is_insulated", False),
                is_certified=data.get("is_certified", False),
                energy_class=data.get("energy_class", ""),
                orientation=data.get("orientation", ""),
                total_area=data.get("total_area"),
                examined_area=data.get("examined_area"),
                floors_examined=data.get("floors_examined", 1),
                floor_height=data.get("floor_height"),
                construction_type=data.get("construction_type", ""),
                free_facades=data.get("free_facades"),
                altitude=data.get("altitude"),
                non_operating_days=data.get("non_operating_days", ""),
                operating_hours=data.get("operating_hours", ""),
                occupants=data.get("occupants")
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({
            "uuid": str(building.uuid),
            "message": "Building created successfully"
        }, status=201)
    
    else:
        return HttpResponseBadRequest("Only POST method is allowed")
    
# Update the get_buildings function to return all fields
@csrf_exempt
def get_buildings(request):
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
    
    project_uuid = request.GET.get("project")
    if project_uuid:
        buildings = Building.objects.filter(user=user, project__uuid=project_uuid)
    else:
        buildings = Building.objects.filter(user=user)
    
    buildings_list = [{
        "uuid": str(b.uuid),
        "name": b.name,
        "project": str(b.project.uuid),
        "usage": b.usage,
        "user": str(b.user.email),
        "description": b.description,
        "year_built": b.year_built,
        "address": b.address,
        "is_insulated": b.is_insulated,
        "is_certified": b.is_certified,
        "energy_class": b.energy_class,
        "orientation": b.orientation,
        "total_area": str(b.total_area),
        "examined_area": str(b.examined_area),
        "floors_examined": b.floors_examined,
        "floor_height": str(b.floor_height) if b.floor_height else None,
        "construction_type": b.construction_type,
        "free_facades": b.free_facades,
        "altitude": str(b.altitude) if b.altitude else None,
        "non_operating_days": b.non_operating_days,
        "operating_hours": b.operating_hours,
        "occupants": b.occupants,
        "date_created": b.date_created.strftime("%d-%m-%Y")
    } for b in buildings]
    
    return JsonResponse({"buildings": buildings_list}, status=200)

@csrf_exempt
def get_building_detail(request, uuid):
    """
    Endpoint για την ανάκτηση λεπτομερειών ενός συγκεκριμένου κτιρίου.
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
        building = Building.objects.get(uuid=uuid)
        
        # Έλεγχος αν ο authenticated χρήστης έχει δικαίωμα πρόσβασης στο κτίριο
        if building.user != user:
            return JsonResponse({"error": "Access denied: You do not own this building"}, status=403)
        
        # Επιστρέφουμε αναλυτικά όλα τα πεδία του κτιρίου
        building_data = {
            "uuid": str(building.uuid),
            "name": building.name,
            "project": str(building.project.uuid),
            "usage": building.usage,
            "user": str(building.user.email),
            "description": building.description,
            "year_built": building.year_built,
            "address": building.address,
            "is_insulated": building.is_insulated,
            "is_certified": building.is_certified,
            "energy_class": building.energy_class,
            "orientation": building.orientation,
            "total_area": str(building.total_area),
            "examined_area": str(building.examined_area),
            "floors_examined": building.floors_examined,
            "floor_height": str(building.floor_height) if building.floor_height else None,
            "construction_type": building.construction_type,
            "free_facades": building.free_facades,
            "altitude": str(building.altitude) if building.altitude else None,
            "non_operating_days": building.non_operating_days,
            "operating_hours": building.operating_hours,
            "occupants": building.occupants,
            "date_created": building.date_created.strftime("%d-%m-%Y")
        }
        
        return JsonResponse(building_data, status=200)
    
    except Building.DoesNotExist:
        return JsonResponse({"error": "Building not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_building(request, building_uuid):
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
        building = Building.objects.get(uuid=building_uuid)
    except Building.DoesNotExist:
        return JsonResponse({"error": "Building not found"}, status=404)
    
    if building.user != user:
        return JsonResponse({"error": "Access denied: You do not own this building"}, status=403)
    
    building.delete()
    return JsonResponse({"message": "Building deleted successfully"}, status=200)

@receiver(post_save, sender=Building)
def building_post_save_update_project_buildings_count(sender, instance, **kwargs):
    project = instance.project
    if project:
        project.buildings_count = project.buildings.count()
        project.save(update_fields=['buildings_count'])

@receiver(post_delete, sender=Building)
def building_post_delete_update_project_buildings_count(sender, instance, **kwargs):
    project = instance.project
    if project and hasattr(project, 'pk') and project.pk is not None:
        try:
            # Re-fetch the project to ensure its state is current if it still exists
            project_instance = Project.objects.get(pk=project.pk)
            # Recalculate count based on current state
            new_count = project_instance.buildings.count()
            if project_instance.buildings_count != new_count:
                project_instance.buildings_count = new_count
                project_instance.save(update_fields=['buildings_count'])
                logger.info(f"Successfully updated buildings_count for project {project.pk} to {new_count} after building delete.")
            else:
                logger.info(f"buildings_count for project {project.pk} is already {new_count}. No update needed after building delete.")
        except Project.DoesNotExist:
            # Project was deleted, which is expected if this is part of a cascade delete.
            logger.info(f"Project {project.pk if project else 'unknown'} not found during building delete signal (likely deleted). No count update needed.")
            pass
        except Exception as e:
            # Catch any other error during .save()
            logger.error(
                f"Could not update buildings_count for project {project.pk if project else 'unknown'} during building delete signal. Error: {str(e)}",
                exc_info=True  # This will log the full traceback for the exception in the signal
            )
            pass

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_building(request, uuid):
    """
    Endpoint για την ενημέρωση ενός building.
    """
    try:
        building = Building.objects.get(uuid=uuid)
        
        if building.project.user != request.user:
            return Response(
                {"error": "You don't have permission to update this building"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BuildingSerializer(building, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except Building.DoesNotExist:
        return Response(
            {"error": "Building not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
