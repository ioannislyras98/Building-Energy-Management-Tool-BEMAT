import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Building
from project.models import Project
from rest_framework.authtoken.models import Token

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
        "date_created": b.date_created.strftime("%Y-%m-%d %H:%M:%S")
    } for b in buildings]
    
    return JsonResponse({"buildings": buildings_list}, status=200)
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
    
    # Έλεγχος αν ο authenticated χρήστης είναι ο ιδιοκτήτης του κτιρίου
    if building.user != user:
        return JsonResponse({"error": "Access denied: You do not own this building"}, status=403)
    
    building.delete()
    return JsonResponse({"message": "Building deleted successfully"}, status=200)

@receiver(post_save, sender=Building)
def update_buildings_count(sender, instance, created, **kwargs):
    if created:
        project = instance.project
        project.buildings_count = project.buildings.count()
        project.save()
