import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from .models import Building
from project.models import Project
from rest_framework.authtoken.models import Token

def get_user_from_token(token):
    try:
        token_obj = Token.objects.get(key=token)
        return token_obj.user
    except Token.DoesNotExist:
        return None

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

        # Ορισμός των required πεδίων (χωρίς το "user" γιατί προέρχεται από το token)
        required_fields = ["project", "name", "usage", "total_area", "examined_area", "no_ppm", "nox_ppm", "co2_ppm", "smoke_scale", "exhaust_temperature"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return JsonResponse({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }, status=400)

        # Fetch the related Project instance using the provided uuid.
        project_uuid = data.get("project")
        try:
            project = Project.objects.get(uuid=project_uuid, user=user)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Project not found or access denied"}, status=404)

        try:
            building = Building.objects.create(
                project=project,  # pass the Project instance
                user=user,
                name=data.get("name", ""),
                usage=data.get("usage", ""),
                description=data.get("description", ""),
                year_built=data.get("year_built"),
                address=data.get("address", ""),
                is_insulated=data.get("is_insulated", False),
                is_certified=data.get("is_certified", False),
                energy_class=data.get("energy_class", ""),
                orientation=data.get("orientation", ""),
                total_area=data.get("total_area"),
                examined_area=data.get("examined_area"),
                floors_examined=data.get("floors_examined", 1),
                room_temperature=data.get("room_temperature", 25),
                no_ppm=data.get("no_ppm"),
                nox_ppm=data.get("nox_ppm"),
                co2_ppm=data.get("co2_ppm"),
                smoke_scale=data.get("smoke_scale"),
                exhaust_temperature=data.get("exhaust_temperature")
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({
            "uuid": str(building.uuid),
            "message": "Building created successfully"
        }, status=201)
    else:
        return HttpResponseBadRequest("Only POST method is allowed")

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
        "total_area": str(b.total_area),
        "examined_area": str(b.examined_area)
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
