"""
Admin-only views for system administration and monitoring
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from user.models import User
from project.models import Project
from building.models import Building
from buildingActivity.models import BuildingActivity
from common.utils import standard_error_response, standard_success_response, is_admin_user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get comprehensive system statistics for admin dashboard
    """
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__isnull=False).count()
        
        # Project statistics
        total_projects = Project.objects.count()
        projects_by_user = Project.objects.values('user__email').annotate(
            count=Count('uuid')
        ).order_by('-count')[:10]
        
        # Building statistics
        total_buildings = Building.objects.count()
        buildings_by_user = Building.objects.values('user__email').annotate(
            count=Count('uuid')
        ).order_by('-count')[:10]
        
        # Activity statistics
        total_activities = BuildingActivity.objects.count()
        week_ago = timezone.now() - timedelta(days=7)
        recent_activities = BuildingActivity.objects.filter(created_at__gte=week_ago).count()
        
        activities_by_type = BuildingActivity.objects.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        activities_by_user = BuildingActivity.objects.exclude(user__isnull=True).values(
            'user__email'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        # Recent registrations (last 30 days)
        month_ago = timezone.now() - timedelta(days=30)
        recent_registrations = User.objects.filter(date_joined__gte=month_ago).count()
        
        return standard_success_response({
            'users': {
                'total': total_users,
                'active': active_users,
                'recent_registrations': recent_registrations
            },
            'projects': {
                'total': total_projects,
                'by_user': list(projects_by_user)
            },
            'buildings': {
                'total': total_buildings,
                'by_user': list(buildings_by_user)
            },
            'activities': {
                'total': total_activities,
                'recent_week': recent_activities,
                'by_type': list(activities_by_type),
                'by_user': list(activities_by_user)
            }
        })
        
    except Exception as e:
        return standard_error_response(f"Error getting admin stats: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """
    Get list of all users with their statistics
    """
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        users = User.objects.all()
        users_data = []
        
        for user in users:
            user_projects = Project.objects.filter(user=user).count()
            user_buildings = Building.objects.filter(user=user).count()
            user_activities = BuildingActivity.objects.filter(building__user=user).count()
            
            users_data.append({
                'uuid': user.uuid,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
                'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
                'projects_count': user_projects,
                'buildings_count': user_buildings,
                'activities_count': user_activities
            })
        
        return standard_success_response({'users': users_data})
        
    except Exception as e:
        return standard_error_response(f"Error getting users list: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_uuid):
    """
    Get detailed information about a specific user
    """
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(uuid=user_uuid)
        
        # Get user's projects with building counts
        projects = Project.objects.filter(user=user)
        projects_data = [{
            'uuid': project.uuid,
            'name': project.name,
            'date_created': project.date_created.strftime('%Y-%m-%d'),
            'buildings_count': project.buildings_count,
            'cost_per_kwh_fuel': str(project.cost_per_kwh_fuel),
            'cost_per_kwh_electricity': str(project.cost_per_kwh_electricity)
        } for project in projects]
        
        # Get user's buildings
        buildings = Building.objects.filter(user=user)
        buildings_data = [{
            'uuid': building.uuid,
            'name': building.name,
            'project_name': building.project.name,
            'usage': building.usage,
            'address': building.address,
            'total_area': building.total_area
        } for building in buildings]
        
        # Get recent activities
        recent_activities = BuildingActivity.objects.filter(
            building__user=user
        ).order_by('-created_at')[:20]
        
        activities_data = [{
            'id': activity.id,
            'title': activity.title,
            'action_type': activity.action_type,
            'building_name': activity.building.name,
            'created_at': activity.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for activity in recent_activities]
        
        user_data = {
            'uuid': user.uuid,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else None,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'projects': projects_data,
            'buildings': buildings_data,
            'recent_activities': activities_data
        }
        
        return standard_success_response({'user': user_data})
        
    except User.DoesNotExist:
        return standard_error_response("User not found", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return standard_error_response(f"Error getting user detail: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)
