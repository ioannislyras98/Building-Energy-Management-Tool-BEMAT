from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
import json
from .models import CoolingSystem
from building.models import Building
from project.models import Project
import uuid
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializer import CoolingSystemSerializer

def get_user_from_token(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None

@csrf_exempt
def create_cooling_system(request):
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
        
        # Έλεγχος αν ο χρήστης έχει δικαίωμα να προσθέσει cooling system στο building
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
            cooling_system = CoolingSystem.objects.create(
                building=building,
                project=project,
                user=user,
                cooling_system_type=data.get("cooling_system_type"),
                cooling_unit_accessibility=data.get("cooling_unit_accessibility"),
                heat_pump_type=data.get("heat_pump_type"),
                power_kw=data.get("power_kw"),
                construction_year=data.get("construction_year"),
                energy_efficiency_ratio=data.get("energy_efficiency_ratio"),
                maintenance_period=data.get("maintenance_period"),
                operating_hours=data.get("operating_hours")
            )
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
        return JsonResponse({
            "uuid": str(cooling_system.uuid),
            "cooling_system_type": cooling_system.cooling_system_type,
            "cooling_unit_accessibility": cooling_system.cooling_unit_accessibility,
            "heat_pump_type": cooling_system.heat_pump_type,
            "power_kw": float(cooling_system.power_kw) if cooling_system.power_kw is not None else None,
            "construction_year": cooling_system.construction_year,
            "energy_efficiency_ratio": float(cooling_system.energy_efficiency_ratio) if cooling_system.energy_efficiency_ratio is not None else None,
            "maintenance_period": cooling_system.maintenance_period,
            "operating_hours": cooling_system.operating_hours,
        }, status=201)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

@csrf_exempt
@require_http_methods(["GET"])
def get_building_cooling_systems(request, building_uuid):
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
        
        # Check if the user has permission to view cooling systems for this building
        if building.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να δείτε συστήματα ψύξης για αυτό το κτίριο'
            }, status=403)
            
        # Filter by building and user
        cooling_systems = CoolingSystem.objects.filter(building=building, user=user)
        
        data = []
        for system in cooling_systems:
            data.append({
                'uuid': str(system.uuid),
                'project': str(system.project.uuid) if system.project else None,
                'cooling_system_type': system.cooling_system_type,
                'cooling_unit_accessibility': system.cooling_unit_accessibility,
                'heat_pump_type': system.heat_pump_type,
                'power_kw': float(system.power_kw) if system.power_kw is not None else None,
                'construction_year': system.construction_year,
                'energy_efficiency_ratio': float(system.energy_efficiency_ratio) if system.energy_efficiency_ratio is not None else None,
                'maintenance_period': system.maintenance_period,
                'operating_hours': system.operating_hours,
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
def update_cooling_system(request, system_uuid):
    """
    Endpoint για την ενημέρωση των λεπτομερειών συστήματος ψύξης.
    """
    try:
        cooling_system = CoolingSystem.objects.get(uuid=system_uuid)
        
        # Check if the user has permission to update this cooling system
        if cooling_system.user != request.user:
            return Response(
                {"error": "You don't have permission to update this cooling system"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CoolingSystemSerializer(cooling_system, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    except CoolingSystem.DoesNotExist:
        return Response(
            {"error": "Cooling system not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
def delete_cooling_system(request, system_uuid):
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
        cooling_system = get_object_or_404(CoolingSystem, uuid=system_uuid)
        
        # Check if the user has permission to delete this cooling system
        if cooling_system.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να διαγράψετε αυτό το σύστημα ψύξης'
            }, status=403)
            
        cooling_system.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Το σύστημα ψύξης διαγράφηκε επιτυχώς'
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