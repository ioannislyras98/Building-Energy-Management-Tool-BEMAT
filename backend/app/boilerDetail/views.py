from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
import json
from .models import BoilerDetail
from building.models import Building
from project.models import Project
import uuid
from rest_framework.authtoken.models import Token

def get_user_from_token(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None

@csrf_exempt
def create_boiler_detail(request):
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
        
        # Έλεγχος αν ο χρήστης έχει δικαίωμα να προσθέσει boiler στο building
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
            boiler_detail = BoilerDetail.objects.create(
                building=building,
                project=project,
                user=user,
                nominal_power=data.get("nominal_power"),
                internal_efficiency=data.get("internal_efficiency"),
                manufacturing_year=data.get("manufacturing_year"),
                nitrogen_monoxide=data.get("nitrogen_monoxide"),
                nitrogen_oxides=data.get("nitrogen_oxides"),
                exhaust_temperature=data.get("exhaust_temperature"),
                smoke_scale=data.get("smoke_scale"),
                room_temperature=data.get("room_temperature")
            )
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
        return JsonResponse({
            "uuid": str(boiler_detail.uuid),
            "nominal_power": float(boiler_detail.nominal_power) if boiler_detail.nominal_power else None,
            "internal_efficiency": float(boiler_detail.internal_efficiency) if boiler_detail.internal_efficiency else None,
            "manufacturing_year": boiler_detail.manufacturing_year,
            "nitrogen_monoxide": float(boiler_detail.nitrogen_monoxide) if boiler_detail.nitrogen_monoxide else None,
            "nitrogen_oxides": float(boiler_detail.nitrogen_oxides) if boiler_detail.nitrogen_oxides else None,
            "exhaust_temperature": float(boiler_detail.exhaust_temperature) if boiler_detail.exhaust_temperature else None,
            "smoke_scale": float(boiler_detail.smoke_scale) if boiler_detail.smoke_scale else None,
            "room_temperature": float(boiler_detail.room_temperature) if boiler_detail.room_temperature else None,
        }, status=201)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

@csrf_exempt
@require_http_methods(["GET"])
def get_building_boiler_details(request, building_uuid):
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
        
        # Check if the user has permission to view boiler details for this building
        if building.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να δείτε λέβητες για αυτό το κτίριο'
            }, status=403)
            
        # Filter by building and user
        boiler_details = BoilerDetail.objects.filter(building=building, user=user)
        
        data = []
        for boiler in boiler_details:
            data.append({
                'uuid': str(boiler.uuid),
                'project': str(boiler.project.uuid) if boiler.project else None,
                'nominal_power': float(boiler.nominal_power) if boiler.nominal_power else None,
                'internal_efficiency': float(boiler.internal_efficiency) if boiler.internal_efficiency else None,
                'manufacturing_year': boiler.manufacturing_year,
                'nitrogen_monoxide': float(boiler.nitrogen_monoxide) if boiler.nitrogen_monoxide else None,
                'nitrogen_oxides': float(boiler.nitrogen_oxides) if boiler.nitrogen_oxides else None,
                'exhaust_temperature': float(boiler.exhaust_temperature) if boiler.exhaust_temperature else None,
                'smoke_scale': float(boiler.smoke_scale) if boiler.smoke_scale else None,
                'room_temperature': float(boiler.room_temperature) if boiler.room_temperature else None,
                'created_at': boiler.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': boiler.updated_at.strftime('%Y-%m-%d %H:%M:%S')
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

@csrf_exempt
def update_boiler_detail(request, boiler_uuid):
    if request.method != "PUT":
        return JsonResponse({"error": "Only PUT method is allowed"}, status=405)
        
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
        boiler_uuid = uuid.UUID(boiler_uuid)
        boiler_detail = get_object_or_404(BoilerDetail, uuid=boiler_uuid)
        
        # Check if the user has permission to update this boiler detail
        if boiler_detail.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να τροποποιήσετε αυτόν τον λέβητα'
            }, status=403)
            
        data = json.loads(request.body)
        
        # Check if project is being updated
        if 'project' in data:
            project_uuid = data.get('project')
            if project_uuid:
                try:
                    project = Project.objects.get(uuid=project_uuid)
                    
                    # Check if the user has permission to add to this project
                    if project.user != user:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'Δεν έχετε δικαίωμα να προσθέσετε λέβητα σε αυτό το έργο'
                        }, status=403)
                    boiler_detail.project = project
                except Project.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Έργο δεν βρέθηκε'
                    }, status=404)
            else:
                boiler_detail.project = None
        
        # Update the rest of the fields
        update_fields = [
            'nominal_power', 'internal_efficiency', 'manufacturing_year', 
            'nitrogen_monoxide', 'nitrogen_oxides', 'exhaust_temperature',
            'smoke_scale', 'room_temperature'
        ]
        
        for field in update_fields:
            if field in data:
                setattr(boiler_detail, field, data[field])
        
        try:
            boiler_detail.full_clean()
            boiler_detail.save()
        except ValidationError as e:
            error_messages = {}
            for field, errors in e.message_dict.items():
                error_messages[field] = errors[0] if errors else "Validation error"
            return JsonResponse({"validation_errors": error_messages}, status=400)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Ο λέβητας ενημερώθηκε επιτυχώς'
        })
    except ValueError:
        return JsonResponse({
            'status': 'error',
            'message': 'Μη έγκυρο UUID'
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Μη έγκυρα δεδομένα JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@csrf_exempt
def delete_boiler_detail(request, boiler_uuid):
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
        boiler_uuid = uuid.UUID(boiler_uuid)
        boiler_detail = get_object_or_404(BoilerDetail, uuid=boiler_uuid)
        
        # Check if the user has permission to delete this boiler detail
        if boiler_detail.user != user:
            return JsonResponse({
                'status': 'error',
                'message': 'Δεν έχετε δικαίωμα να διαγράψετε αυτόν τον λέβητα'
            }, status=403)
            
        boiler_detail.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Ο λέβητας διαγράφηκε επιτυχώς'
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