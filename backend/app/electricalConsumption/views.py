from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import ElectricalConsumption
from .serializer import ElectricalConsumptionSerializer
from building.models import Building
from project.models import Project
from thermalZone.models import ThermalZone
from energyConsumption.models import EnergyConsumption
from common.utils import (
    get_user_from_token, 
    standard_error_response, 
    standard_success_response,
    validate_uuid,
    check_user_ownership,
    is_admin_user,
    has_access_permission
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_electrical_consumption(request):
    try:
        data = request.data
        
        if not data.get("building"):
            return standard_error_response("Building is required", status.HTTP_400_BAD_REQUEST)
        
        if not data.get("thermal_zone"):
            return standard_error_response("Thermal zone is required", status.HTTP_400_BAD_REQUEST)
        
        if not data.get("consumption_type"):
            return standard_error_response("Consumption type is required", status.HTTP_400_BAD_REQUEST)
        
        if not validate_uuid(data.get("building")):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            building = Building.objects.get(uuid=data.get("building"))
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        try:
            thermal_zone = ThermalZone.objects.get(uuid=data.get("thermal_zone"))
            if thermal_zone.building != building:
                return standard_error_response("Thermal zone does not belong to this building", status.HTTP_400_BAD_REQUEST)
        except ThermalZone.DoesNotExist:
            return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        project = None
        if data.get("project"):
            if not validate_uuid(data.get("project")):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
            try:
                project = Project.objects.get(uuid=data.get("project"))
                if not has_access_permission(request.user, project):
                    return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
            except Project.DoesNotExist:
                return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        energy_consumption = None
        if data.get("energy_consumption"):
            if not validate_uuid(data.get("energy_consumption")):
                return standard_error_response("Invalid energy consumption UUID", status.HTTP_400_BAD_REQUEST)
            
            try:
                energy_consumption = EnergyConsumption.objects.get(uuid=data.get("energy_consumption"))
                if energy_consumption.building != building:
                    return standard_error_response("Energy consumption does not belong to this building", status.HTTP_400_BAD_REQUEST)
            except EnergyConsumption.DoesNotExist:
                return standard_error_response("Energy consumption not found", status.HTTP_404_NOT_FOUND)
        
        electrical_consumption = ElectricalConsumption.objects.create(
            building=building,
            project=project,
            user=request.user,
            consumption_type=data.get("consumption_type"),
            thermal_zone=thermal_zone,
            period=data.get("period"),
            energy_consumption=energy_consumption,
            load_type=data.get("load_type"),
            load_power=data.get("load_power"),
            quantity=data.get("quantity"),
            operating_hours_per_year=data.get("operating_hours_per_year")
        )
        
        serializer = ElectricalConsumptionSerializer(electrical_consumption)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_electrical_consumptions(request, building_uuid):
    try:
        if not validate_uuid(building_uuid):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            building = Building.objects.get(uuid=building_uuid)
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return standard_error_response("Access denied: You do not have permission to view electrical consumptions for this building", status.HTTP_403_FORBIDDEN)
        
        if is_admin_user(request.user):
            electrical_consumptions = ElectricalConsumption.objects.filter(
                building=building
            ).select_related('thermal_zone', 'energy_consumption')
        else:
            electrical_consumptions = ElectricalConsumption.objects.filter(
                building=building, 
                user=request.user
            ).select_related('thermal_zone', 'energy_consumption')
        
        serializer = ElectricalConsumptionSerializer(electrical_consumptions, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_electrical_consumption(request, consumption_uuid):
    try:
        if not validate_uuid(consumption_uuid):
            return standard_error_response("Invalid electrical consumption UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            electrical_consumption = ElectricalConsumption.objects.get(uuid=consumption_uuid)
        except ElectricalConsumption.DoesNotExist:
            return standard_error_response("Electrical consumption not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, electrical_consumption):
            return standard_error_response("Access denied: You do not own this electrical consumption", status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        if "thermal_zone" in data and data.get("thermal_zone"):
            try:
                thermal_zone = ThermalZone.objects.get(uuid=data.get("thermal_zone"))
                if thermal_zone.building != electrical_consumption.building:
                    return standard_error_response("Thermal zone does not belong to this building", status.HTTP_400_BAD_REQUEST)
                electrical_consumption.thermal_zone = thermal_zone
            except ThermalZone.DoesNotExist:
                return standard_error_response("Thermal zone not found", status.HTTP_404_NOT_FOUND)
        
        if "energy_consumption" in data and data.get("energy_consumption"):
            try:
                energy_consumption = EnergyConsumption.objects.get(uuid=data.get("energy_consumption"))
                if energy_consumption.building != electrical_consumption.building:
                    return standard_error_response("Energy consumption does not belong to this building", status.HTTP_400_BAD_REQUEST)
                electrical_consumption.energy_consumption = energy_consumption
            except EnergyConsumption.DoesNotExist:
                return standard_error_response("Energy consumption not found", status.HTTP_404_NOT_FOUND)
        
        if "consumption_type" in data:
            electrical_consumption.consumption_type = data.get("consumption_type")
        if "period" in data:
            electrical_consumption.period = data.get("period")
        if "load_type" in data:
            electrical_consumption.load_type = data.get("load_type")
        if "load_power" in data:
            electrical_consumption.load_power = data.get("load_power")
        if "quantity" in data:
            electrical_consumption.quantity = data.get("quantity")
        if "operating_hours_per_year" in data:
            electrical_consumption.operating_hours_per_year = data.get("operating_hours_per_year")
        
        electrical_consumption.save()
        
        serializer = ElectricalConsumptionSerializer(electrical_consumption)
        return standard_success_response(serializer.data, "Electrical consumption updated successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_electrical_consumption(request, consumption_uuid):
    try:
        if not validate_uuid(consumption_uuid):
            return standard_error_response("Invalid electrical consumption UUID", status.HTTP_400_BAD_REQUEST)
        
        try:
            electrical_consumption = ElectricalConsumption.objects.get(uuid=consumption_uuid)
        except ElectricalConsumption.DoesNotExist:
            return standard_error_response("Electrical consumption not found", status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, electrical_consumption):
            return standard_error_response("Access denied: You do not own this electrical consumption", status.HTTP_403_FORBIDDEN)
        
        electrical_consumption.delete()
        return standard_success_response(None, "Electrical consumption deleted successfully", status.HTTP_204_NO_CONTENT)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
