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
    check_user_ownership,
    is_admin_user,
    has_access_permission
)

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_building(request):
    try:
        data = request.data
        
        required_fields = ["name", "usage", "description", "address", "total_area", "examined_area", "floors_examined", "project", "prefecture"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return standard_error_response(f"{field} is required", status.HTTP_400_BAD_REQUEST)
        
        if not validate_uuid(data.get("project")):
            return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            project = Project.objects.get(uuid=data.get("project"))
        except Project.DoesNotExist:
            return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, project):
            return standard_error_response("Access denied: You do not have permission to add buildings to this project", status.HTTP_403_FORBIDDEN)
        
        prefecture_id = data.get("prefecture")
        try:
            from prefectures.models import Prefecture
            prefecture = Prefecture.objects.get(uuid=prefecture_id)
        except Prefecture.DoesNotExist:
            return standard_error_response("Prefecture not found", status.HTTP_404_NOT_FOUND)
        except ValueError:
            return standard_error_response("Invalid prefecture ID", status.HTTP_400_BAD_REQUEST)
        
        building_data = {
            'user': request.user,
            'project': project,
            'name': data.get("name"),
            'usage': data.get("usage"),
            'description': data.get("description"),
            'year_built': data.get("year_built"),
            'address': data.get("address", ""),
            'is_insulated': data.get("is_insulated", False),
            'is_certified': data.get("is_certified", False),
            'energy_class': data.get("energy_class", ""),
            'orientation': data.get("orientation", ""),
            'total_area': data.get("total_area"),
            'examined_area': data.get("examined_area"),
            'floors_examined': data.get("floors_examined", 1),
            'floor_height': data.get("floor_height"),
            'construction_type': data.get("construction_type", ""),
            'free_facades': data.get("free_facades"),
            'altitude': data.get("altitude"),
            'non_operating_days': data.get("non_operating_days", ""),
            'operating_hours': data.get("operating_hours", ""),
            'occupants': data.get("occupants"),
        }
        
        building_data['prefecture'] = prefecture
        
        building = Building.objects.create(**building_data)
        
        serializer = BuildingSerializer(building)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_buildings(request):
    try:
        project_uuid = request.GET.get("project")
        
        if project_uuid:
            if not validate_uuid(project_uuid):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
            if is_admin_user(request.user):
                buildings = Building.objects.filter(project__uuid=project_uuid)
            else:
                buildings = Building.objects.filter(user=request.user, project__uuid=project_uuid)
        else:
            if is_admin_user(request.user):
                buildings = Building.objects.all()
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
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
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
            "prefecture": str(building.prefecture.uuid),
            "prefecture_data": {
                "uuid": str(building.prefecture.uuid),
                "name": building.prefecture.name,
                "zone": building.prefecture.zone,
                "zone_display": f"Ζώνη {building.prefecture.zone}",
                "temperature_winter": building.prefecture.temperature_winter,
                "temperature_summer": building.prefecture.temperature_summer,
            },
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
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not have permission to delete this building", status.HTTP_403_FORBIDDEN)
        
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
            project_instance = Project.objects.get(pk=project.pk)
            new_count = project_instance.buildings.count()
            if project_instance.buildings_count != new_count:
                project_instance.buildings_count = new_count
                project_instance.save(update_fields=['buildings_count'])
                logger.info(f"Successfully updated buildings_count for project {project.pk} to {new_count} after building delete.")
            else:
                logger.info(f"buildings_count for project {project.pk} is already {new_count}. No update needed after building delete.")
        except Project.DoesNotExist:
            logger.info(f"Project {project.pk if project else 'unknown'} not found during building delete signal (likely deleted). No count update needed.")
            pass
        except Exception as e:
            logger.error(
                f"Could not update buildings_count for project {project.pk if project else 'unknown'} during building delete signal. Error: {str(e)}",
                exc_info=True 
            )
            pass

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_building(request, uuid):
    """
    Endpoint for updating a building.
    """
    try:
        logger.info(f"Building update request received for UUID: {uuid} by user: {request.user.email}")
        logger.debug(f"Update data: {request.data}")
        
        building = Building.objects.get(uuid=uuid)
        
        if not has_access_permission(request.user, building):
            logger.warning(f"Permission denied: User {request.user.email} attempted to update building {uuid} without permission")
            return Response(
                {"error": "You don't have permission to update this building"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BuildingSerializer(building, data=request.data, partial=True)
        if serializer.is_valid():
            logger.debug(f"Serializer valid, saving building {uuid}")
            serializer.save()
            logger.info(f"Building {uuid} updated successfully by user {request.user.email}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        logger.warning(f"Building update validation failed for {uuid}: {serializer.errors}")
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except Building.DoesNotExist:
        logger.error(f"Building not found: {uuid}")
        return Response(
            {"error": "Building not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
