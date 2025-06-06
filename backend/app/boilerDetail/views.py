from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import BoilerDetail
from .serializer import BoilerDetailSerializer
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
def create_boiler_detail(request):
    try:
        data = request.data
        
        # Validate required fields
        if not data.get("building"):
            return standard_error_response("Building is required", status.HTTP_400_BAD_REQUEST)
        
        # Validate building UUID
        if not validate_uuid(data.get("building")):
            return standard_error_response("Invalid building UUID", status.HTTP_400_BAD_REQUEST)
        
        # Check building exists and user has permission
        try:
            building = Building.objects.get(uuid=data.get("building"))
        except Building.DoesNotExist:
            return standard_error_response("Building not found", status.HTTP_404_NOT_FOUND)
        
        if not check_user_ownership(request.user, building):
            return standard_error_response("Access denied: You do not own this building", status.HTTP_403_FORBIDDEN)
        
        # Check project exists and user has permission (if provided)
        project = None
        if data.get("project"):
            if not validate_uuid(data.get("project")):
                return standard_error_response("Invalid project UUID", status.HTTP_400_BAD_REQUEST)
            
            try:
                project = Project.objects.get(uuid=data.get("project"))
                if not check_user_ownership(request.user, project):
                    return standard_error_response("Access denied: You do not own this project", status.HTTP_403_FORBIDDEN)
            except Project.DoesNotExist:
                return standard_error_response("Project not found", status.HTTP_404_NOT_FOUND)
        
        # Create boiler detail
        boiler_detail = BoilerDetail.objects.create(
            building=building,
            project=project,
            user=request.user,
            nominal_power=data.get("nominal_power"),
            internal_efficiency=data.get("internal_efficiency"),
            manufacturing_year=data.get("manufacturing_year"),
            fuel_type=data.get("fuel_type"),
            nitrogen_monoxide=data.get("nitrogen_monoxide"),
            nitrogen_oxides=data.get("nitrogen_oxides"),
            exhaust_temperature=data.get("exhaust_temperature"),
            smoke_scale=data.get("smoke_scale"),
            room_temperature=data.get("room_temperature")
        )
        
        serializer = BoilerDetailSerializer(boiler_detail)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_building_boiler_details(request, building_uuid):
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
            return standard_error_response("Access denied: You do not have permission to view boiler details for this building", status.HTTP_403_FORBIDDEN)
        
        # Get boiler details for building
        boiler_details = BoilerDetail.objects.filter(
            building=building, 
            user=request.user
        )
        
        serializer = BoilerDetailSerializer(boiler_details, many=True)
        return standard_success_response(serializer.data)
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_boiler_detail(request, boiler_uuid):
    try:
        # Validate boiler UUID
        if not validate_uuid(boiler_uuid):
            return standard_error_response("Invalid boiler UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get boiler detail
        try:
            boiler_detail = BoilerDetail.objects.get(uuid=boiler_uuid)
        except BoilerDetail.DoesNotExist:
            return standard_error_response("Boiler detail not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, boiler_detail):
            return standard_error_response("Access denied: You do not have permission to update this boiler detail", status.HTTP_403_FORBIDDEN)
        
        # Update boiler detail
        serializer = BoilerDetailSerializer(
            boiler_detail, 
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
def delete_boiler_detail(request, boiler_uuid):
    try:
        # Validate boiler UUID
        if not validate_uuid(boiler_uuid):
            return standard_error_response("Invalid boiler UUID", status.HTTP_400_BAD_REQUEST)
        
        # Get boiler detail
        try:
            boiler_detail = BoilerDetail.objects.get(uuid=boiler_uuid)
        except BoilerDetail.DoesNotExist:
            return standard_error_response("Boiler detail not found", status.HTTP_404_NOT_FOUND)
        
        # Check user permission
        if not check_user_ownership(request.user, boiler_detail):
            return standard_error_response("Access denied: You do not have permission to delete this boiler detail", status.HTTP_403_FORBIDDEN)
        
        # Delete boiler detail
        boiler_detail.delete()
        return standard_success_response("Boiler detail deleted successfully")
        
    except Exception as e:
        return standard_error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)