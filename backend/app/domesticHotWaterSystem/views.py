from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
import json
from .models import DomesticHotWaterSystem
from building.models import Building
from project.models import Project
import uuid
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializer import DomesticHotWaterSystemSerializer

def get_user_from_token(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None

@csrf_exempt
def create_domestic_hot_water_system(request):
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
        required_fields = ["building"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return JsonResponse({field: "This field is required"}, status=400)
        
        # Έλεγχος αν το building υπάρχει
        try:
            building = Building.objects.get(uuid=data.get("building"))
        except Building.DoesNotExist:
            return JsonResponse({"building": "Building not found"}, status=404)
        
        # Έλεγχος αν ο χρήστης έχει δικαίωμα να προσθέσει heating system στο building
        if building.user != user:
            return JsonResponse({"error": "Access denied: You do not own this building"}, status=403)
        
        # Έλεγχος αν project υπάρχει (αν παρέχεται)
        project = None
        if data.get("project"):
            try:
                project = Project.objects.get(uuid=data.get("project"))
                # Έλεγχος αν ο χρήστης έχει δικαίωμα στο project
                if project.user != user:
                    return JsonResponse({"error": "Access denied: You do not own this project"}, status=403)
            except Project.DoesNotExist:
                return JsonResponse({"project": "Project not found"}, status=404)
        
        try:
            domestic_hot_water_system = DomesticHotWaterSystem.objects.create(
                building=building,
                project=project,
                user=user,
                boiler_type=data.get("boiler_type"),
                power_kw=data.get("power_kw"),
                thermal_efficiency=data.get("thermal_efficiency"),
                distribution_network_state=data.get("distribution_network_state"),
                storage_tank_state=data.get("storage_tank_state"),
                energy_metering_system=data.get("energy_metering_system")
            )
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
        return JsonResponse({
            "uuid": str(domestic_hot_water_system.uuid),
            "boiler_type": domestic_hot_water_system.boiler_type,
            "power_kw": float(domestic_hot_water_system.power_kw) if domestic_hot_water_system.power_kw is not None else None,
            "thermal_efficiency": float(domestic_hot_water_system.thermal_efficiency) if domestic_hot_water_system.thermal_efficiency is not None else None,
            "distribution_network_state": domestic_hot_water_system.distribution_network_state,
            "storage_tank_state": domestic_hot_water_system.storage_tank_state,
            "energy_metering_system": domestic_hot_water_system.energy_metering_system,

        }, status=201)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

@csrf_exempt
@require_http_methods(["GET"])
def get_building_domestic_hot_water_systems(request, building_uuid):
    # Check authentication manually
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
        building_uuid = uuid.UUID(building_uuid)
        building = get_object_or_404(Building, uuid=building_uuid)
        
        # Check if the user has permission to view heating systems for this building
        if building.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να δείτε συστήματα ζέστης για αυτό το κτίριο'
            }, status=403)
            
        # Filter by building and user
        domestic_hot_water_systems = DomesticHotWaterSystem.objects.filter(building=building, user=user)
        
        data = []
        for system in domestic_hot_water_systems:
            data.append({
                'uuid': str(system.uuid),
                'project': str(system.project.uuid) if system.project else None,
                'boiler_type': system.boiler_type,
                'power_kw': float(system.power_kw) if system.power_kw is not None else None,
                'thermal_efficiency': float(system.thermal_efficiency) if system.thermal_efficiency is not None else None,
                'distribution_network_state': system.distribution_network_state,
                'storage_tank_state': system.storage_tank_state,
                'energy_metering_system': system.energy_metering_system,
                'created_at': system.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': system.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return JsonResponse({
            'status': 'success',
            'data': data
        })
    except ValueError:
        return JsonResponse({
            'status': 'error',
            'message': 'Μη έγκυρο UUID κτιρίου'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_domestic_hot_water_system(request, system_uuid):
    """
    Endpoint για την ενημέρωση των λεπτομερειών συστήματος ζέστης.
    """
    try:
        domestic_hot_water_system = DomesticHotWaterSystem.objects.get(uuid=system_uuid)
        
        # Check if the user has permission to update this heating system
        if domestic_hot_water_system.user != request.user:
            return Response(
                {"error": "You don't have permission to update this heating system"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DomesticHotWaterSystemSerializer(domestic_hot_water_system, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except DomesticHotWaterSystem.DoesNotExist:
        return Response(
            {"error": "heating system not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
def delete_domestic_hot_water_system(request, system_uuid):
    if request.method != "DELETE":
        return JsonResponse({"error": "Only DELETE method is allowed"}, status=405)
        
    # Check authentication manually
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
        system_uuid = uuid.UUID(system_uuid)
        domestic_hot_water_system = get_object_or_404(DomesticHotWaterSystem, uuid=system_uuid)
        
        # Check if the user has permission to delete this heating system
        if domestic_hot_water_system.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να διαγράψετε αυτό το σύστημα ζέστης'
            }, status=403)
            
        domestic_hot_water_system.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Το σύστημα ζέστης διαγράφηκε επιτυχώς'
        })
    except ValueError:
        return JsonResponse({
            'status': 'error',
            'message': 'Μη έγκυρο UUID'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
