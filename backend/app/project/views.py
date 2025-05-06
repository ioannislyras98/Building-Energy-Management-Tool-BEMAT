import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from .models import Project
from rest_framework.authtoken.models import Token

def get_user_from_token(token):
    try:
        token_obj = Token.objects.get(key=token)
        return token_obj.user
    except Token.DoesNotExist:
        return None

@csrf_exempt
def create_project(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
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
    required_fields = ["name", "cost_per_kwh_fuel", "cost_per_kwh_electricity"]
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return JsonResponse({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }, status=400)
    try:
        project = Project.objects.create(
            name=data.get("name"),
            cost_per_kwh_fuel=data.get("cost_per_kwh_fuel"),
            cost_per_kwh_electricity=data.get("cost_per_kwh_electricity"),
            user=user
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({
        "uuid": project.uuid,
        "name": project.name,
        "User": project.user.email,
        "message": "Project created successfully"
    }, status=201)

@csrf_exempt
def delete_project(request, project_uuid):
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
        project = Project.objects.get(uuid=project_uuid, user=user)
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found or access denied"}, status=404)
    
    project.delete()
    # Τα buildings που συνδέονται με αυτό το project θα διαγραφούν αυτόματα.
    return JsonResponse({"message": "Project and its buildings deleted successfully"}, status=200)

@csrf_exempt
def get_projects(request):
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
    
    projects = Project.objects.filter(user=user)
    projects_list = [{
        "uuid": project.uuid,
        "name": project.name,
        "date_created": project.date_created.strftime("%Y-%m-%d"),
        "buildings_count": project.buildings_count,
        "cost_per_kwh_fuel": str(project.cost_per_kwh_fuel),
        "cost_per_kwh_electricity": str(project.cost_per_kwh_electricity)
    } for project in projects]
    
    return JsonResponse({"projects": projects_list}, status=200)