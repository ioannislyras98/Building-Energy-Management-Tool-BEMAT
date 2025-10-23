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
from django.core.paginator import Paginator
from django.db import transaction
import json

from user.models import User
from project.models import Project
from building.models import Building
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
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__isnull=False).count()
        
        total_projects = Project.objects.count()
        projects_by_user = Project.objects.values('user__email').annotate(
            count=Count('uuid')
        ).order_by('-count')[:10]
        
        total_buildings = Building.objects.count()
        buildings_by_user = Building.objects.values('user__email').annotate(
            count=Count('uuid')
        ).order_by('-count')[:10]
        
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
                'buildings_count': user_buildings
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
        
        projects = Project.objects.filter(user=user)
        projects_data = [{
            'uuid': project.uuid,
            'name': project.name,
            'date_created': project.date_created.strftime('%Y-%m-%d'),
            'buildings_count': project.buildings_count,
            'cost_per_kwh_fuel': str(project.cost_per_kwh_fuel),
            'cost_per_kwh_electricity': str(project.cost_per_kwh_electricity)
        } for project in projects]
        
        buildings = Building.objects.filter(user=user)
        buildings_data = [{
            'uuid': building.uuid,
            'name': building.name,
            'project_name': building.project.name,
            'usage': building.usage,
            'address': building.address,
            'total_area': building.total_area
        } for building in buildings]
        
        activities_data = []
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_table(request):
    """Get paginated and filtered list of users for admin table view."""
    
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.GET.get('search', '')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 25))
        sort_by = request.GET.get('sort_by', '-date_joined')
        is_staff_filter = request.GET.get('is_staff')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        queryset = User.objects.all()
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        if is_staff_filter is not None:
            queryset = queryset.filter(is_staff=is_staff_filter.lower() == 'true')
        
        if date_from:
            queryset = queryset.filter(date_joined__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_joined__date__lte=date_to)
        
        queryset = queryset.annotate(
            projects_count=Count('projects')
        )
        
        valid_sort_fields = [
            'email', '-email', 'date_joined', '-date_joined', 
            'first_name', '-first_name', 'last_name', '-last_name', 
            'is_staff', '-is_staff', 'projects_count', '-projects_count'
        ]
        
        if sort_by in valid_sort_fields:
            queryset = queryset.order_by(sort_by)
        
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        users_data = []
        for user in page_obj:
            users_data.append({
                'id': str(user.uuid), 
                'email': user.email,
                'username': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,

                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'projects_count': user.projects_count,
            })
        
        return standard_success_response({
            'users': users_data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'per_page': per_page,
                'has_previous': page_obj.has_previous(),
                'has_next': page_obj.has_next(),
            },
            'filters': {
                'search': search,
                'sort_by': sort_by,
                'is_staff': is_staff_filter,
            }
        })
        
    except Exception as e:
        return standard_error_response(f"Error getting users table: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def admin_projects_table(request):
    """Get paginated and filtered list of projects for admin table view."""
    
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.GET.get('search', '')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 25))
        sort_by = request.GET.get('sort_by', '-date_created')
        is_submitted_filter = request.GET.get('is_submitted')
        user_id_filter = request.GET.get('user_id')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        queryset = Project.objects.select_related('user')
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(uuid__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        if is_submitted_filter is not None:
            queryset = queryset.filter(is_submitted=is_submitted_filter.lower() == 'true')
        
        if user_id_filter:
            queryset = queryset.filter(user__uuid=user_id_filter)
        
        if date_from:
            queryset = queryset.filter(date_created__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_created__date__lte=date_to)

        valid_sort_fields = [
            'name', '-name', 'date_created', '-date_created', 'is_submitted', 
            '-is_submitted', 'user__email', '-user__email', 'buildings_count', 
            '-buildings_count', 'cost_per_kwh_fuel', '-cost_per_kwh_fuel'
        ]
        
        if sort_by in valid_sort_fields:
            queryset = queryset.order_by(sort_by)
        
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        projects_data = []
        for project in page_obj:
            projects_data.append({
                'id': str(project.uuid),  
                'uuid': str(project.uuid),
                'name': project.name,
                'user': {
                    'id': str(project.user.uuid), 
                    'email': project.user.email,
                    'username': project.user.email, 
                },
                'is_submitted': project.is_submitted,
                'date_created': project.date_created.isoformat() if project.date_created else None,
                'buildings_count': project.buildings_count,
                'cost_per_kwh_fuel': float(project.cost_per_kwh_fuel) if project.cost_per_kwh_fuel else 0,
                'cost_per_kwh_electricity': float(project.cost_per_kwh_electricity) if project.cost_per_kwh_electricity else 0,
            })
        
        return standard_success_response({
            'projects': projects_data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'per_page': per_page,
                'has_previous': page_obj.has_previous(),
                'has_next': page_obj.has_next(),
            },
            'filters': {
                'search': search,
                'sort_by': sort_by,
                'is_submitted': is_submitted_filter,
                'user_id': user_id_filter,
            }
        })
        
    except Exception as e:
        return standard_error_response(f"Error getting projects table: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_bulk_delete_users(request):
    """Bulk delete users."""
    
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        data = json.loads(request.body)
        user_ids = data.get('user_ids', [])
        
        if not user_ids:
            return standard_error_response('No user IDs provided', status.HTTP_400_BAD_REQUEST)
        
        users_to_delete = User.objects.filter(uuid__in=user_ids)
        
        if not users_to_delete.exists():
            return standard_error_response('No users found with provided IDs', status.HTTP_404_NOT_FOUND)
        
        superusers = users_to_delete.filter(is_superuser=True)
        if superusers.exists():
            return standard_error_response('Cannot delete superusers', status.HTTP_400_BAD_REQUEST)
        
        if str(request.user.uuid) in user_ids:
            return standard_error_response('Cannot delete yourself', status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            deleted_count = users_to_delete.count()
            user_emails = list(users_to_delete.values_list('email', flat=True))
            
            users_to_delete.delete()
        
        return standard_success_response({
            'deleted_count': deleted_count,
            'deleted_users': user_emails[:10],
            'message': f'Successfully deleted {deleted_count} users'
        })
        
    except json.JSONDecodeError:
        return standard_error_response('Invalid JSON data', status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return standard_error_response(f'An error occurred: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_bulk_delete_projects(request):
    """Bulk delete projects."""
    
    if not is_admin_user(request.user):
        return standard_error_response("Access denied: Admin privileges required", status.HTTP_403_FORBIDDEN)
    
    try:
        data = json.loads(request.body)
        project_ids = data.get('project_ids', [])
        
        if not project_ids:
            return standard_error_response('No project IDs provided', status.HTTP_400_BAD_REQUEST)
        
        projects_to_delete = Project.objects.filter(uuid__in=project_ids)
        
        if not projects_to_delete.exists():
            return standard_error_response('No projects found with provided IDs', status.HTTP_404_NOT_FOUND)
        
        with transaction.atomic():
            deleted_count = projects_to_delete.count()
            project_names = list(projects_to_delete.values_list('name', flat=True))
            
            projects_to_delete.delete()
        
        return standard_success_response({
            'deleted_count': deleted_count,
            'deleted_projects': project_names[:10],
            'message': f'Successfully deleted {deleted_count} projects'
        })
        
    except json.JSONDecodeError:
        return standard_error_response('Invalid JSON data', status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return standard_error_response(f'An error occurred: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
