import logging
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Building
from .serializer import BuildingSerializer
from project.models import Project
from contact.models import Contact
from contact.serializers import ContactSerializer
from common.utils import (
    get_user_from_token, 
    standard_error_response, 
    standard_success_response,
    validate_uuid,
    check_user_ownership
)

logger = logging.getLogger(__name__)

# Update the create_building function to match new fields
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_building(request):
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ["name", "usage", "description", "address", "total_area", "examined_area", "floors_examined", "project"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return standard_error_response(f"{field} is required", status.HTTP_400_BAD_REQUEST)
        
        # Validate project UUID
        if not validate_uuid(data.get("project")):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check project exists and user has permission
        try:
            project = Project.objects.get(uuid=data.get("project"))
        except Project.DoesNotExist:
            return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, project):
            return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
        
        # Create building
        building = Building.objects.create(
            user=request.user,
            project=project,
            name=data.get("name"),
            usage=data.get("usage"),
            description=data.get("description"),
            year_built=data.get("year_built"),
            address=data.get("address", ""),
            prefecture=data.get("prefecture", ""),  # Προσθήκη prefecture
            energy_zone=data.get("energy_zone", ""),  # Προσθήκη energy_zone
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
            occupants=data.get("occupants"),
        )
        
        serializer = BuildingSerializer(building)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Update the get_buildings function to return all fields
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_buildings(request):
    try:
        project_uuid = request.GET.get("project")
        
        if project_uuid:
            if not validate_uuid(project_uuid):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            buildings = Building.objects.filter(user=request.user, project__uuid=project_uuid)
        else:
            buildings = Building.objects.filter(user=request.user)
        
        serializer = BuildingSerializer(buildings, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_detail(request, uuid):
    """
    Endpoint για την ανάκτηση λεπτομερειών ενός συγκεκριμένου κτιρίου.
    """
    try:
        if not validate_uuid(uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
            
        building = Building.objects.get(uuid=uuid)
        
        # Έλεγχος αν ο authenticated χρήστης έχει δικαίωμα πρόσβασης στο κτίριο
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        # Ανάκτηση των επαφών για το κτίριο
        contacts = Contact.objects.filter(building=building)
        contacts_data = ContactSerializer(contacts, many=True).data       
        building_data = {
            "uuid": str(building.uuid),
            "name": building.name,
            "project": str(building.project.uuid),
            "project_name": building.project.name, 
            "usage": building.usage,
            "user": str(building.user.email),
            "description": building.description,
            "year_built": building.year_built,
            "address": building.address,
            "is_insulated": building.is_insulated,
            "is_certified": building.is_certified,
            "energy_class": building.energy_class,
            "orientation": building.orientation,
            "total_area": str(building.total_area) if building.total_area is not None else None,
            "examined_area": str(building.examined_area) if building.examined_area is not None else None,
            "floors_examined": building.floors_examined,
            "floor_height": str(building.floor_height) if building.floor_height is not None else None,
            "construction_type": building.construction_type,
            "free_facades": building.free_facades,
            "altitude": str(building.altitude) if building.altitude is not None else None,
            "non_operating_days": building.non_operating_days,
            "operating_hours": building.operating_hours,
            "occupants": building.occupants,
            "date_created": building.date_created.strftime("%d-%m-%Y"),
            "contacts": contacts_data,
            "prefecture": building.prefecture,
            "energy_zone": building.energy_zone,
            }
        
        return standard_success_response(building_data)
    
    except Building.DoesNotExist:
        return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return standard_error_response(f"An unexpected error occurred: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_building(request, uuid):
    try:
        if not validate_uuid(uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
            
        building = Building.objects.get(uuid=uuid)
        
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        building.delete()
        return standard_success_response({"message": "Building deleted successfully"})
        
    except Building.DoesNotExist:
        return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        print(f"Received data for building update: {request.data}")  # Debug log
        
        building = Building.objects.get(uuid=uuid)
        
        if building.project.user != request.user:
            return Response(
                {"error": "You don't have permission to update this building"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BuildingSerializer(building, data=request.data, partial=True)
        if serializer.is_valid():
            print(f"Serializer valid, saving building...")  # Debug log
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        print(f"Serializer errors: {serializer.errors}")  # Debug log
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
