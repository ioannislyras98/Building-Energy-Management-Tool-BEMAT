from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import BuildingActivity, log_building_activity
from .serializers import BuildingActivitySerializer, BuildingActivityCreateSerializer
from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission


class BuildingActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BuildingActivity model
    Provides CRUD operations and custom actions for building activities
    """
    serializer_class = BuildingActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter, SearchFilter]
    filterset_fields = ['building', 'project', 'action_type', 'user']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'action_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Override to show all activities for admin users, only user's activities for regular users
        """
        if is_admin_user(self.request.user):
            return BuildingActivity.objects.all()
        else:
            # For regular users, show only activities related to their buildings
            return BuildingActivity.objects.filter(building__user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BuildingActivityCreateSerializer
        return BuildingActivitySerializer
    
    @action(detail=False, methods=['get'], url_path='building/(?P<building_uuid>[^/.]+)')
    def building_activities(self, request, building_uuid=None):
        """Get all activities for a specific building"""
        building = get_object_or_404(Building, uuid=building_uuid)
        
        # Admin users can access any building's activities, regular users only their own
        if not has_access_permission(request.user, building):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to view activities for this building")
        
        # Filter activities for this building
        activities = self.get_queryset().filter(building=building)
        
        # Apply additional filters
        action_type = request.GET.get('action_type')
        if action_type:
            activities = activities.filter(action_type=action_type)
        
        days = request.GET.get('days')
        if days:
            from django.utils import timezone
            from datetime import timedelta
            since = timezone.now() - timedelta(days=int(days))
            activities = activities.filter(created_at__gte=since)
        
        # Paginate results
        page = self.paginate_queryset(activities)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='building/(?P<building_uuid>[^/.]+)/stats')
    def building_activity_stats(self, request, building_uuid=None):
        """Get activity statistics for a specific building"""
        try:
            building = get_object_or_404(Building, uuid=building_uuid)
            
            # Admin users can access any building's stats, regular users only their own
            if not has_access_permission(request.user, building):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You don't have permission to view stats for this building")
            
            from django.db.models import Count
            from django.utils import timezone
            from datetime import timedelta
            import logging
            
            logger = logging.getLogger(__name__)
            logger.info(f"Getting stats for building: {building_uuid}")
            
            # Get activities for this building
            activities = BuildingActivity.objects.filter(building=building)
            logger.info(f"Found {activities.count()} activities for building")
            
            # Total count
            total_activities = activities.count()
            
            # Activities by type
            by_type = list(activities.values('action_type').annotate(
                count=Count('id')
            ).order_by('-count'))
            
            # Recent activities (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            recent_count = activities.filter(created_at__gte=week_ago).count()
            
            # Activities by day (last 30 days)
            month_ago = timezone.now() - timedelta(days=30)
            daily_stats = []
            for i in range(30):
                day = timezone.now() - timedelta(days=i)
                day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + timedelta(days=1)
                count = activities.filter(
                    created_at__gte=day_start,
                    created_at__lt=day_end
                ).count()
                daily_stats.append({
                    'date': day_start.strftime('%Y-%m-%d'),
                    'count': count
                })
            
            # Most active users - simplified to avoid potential issues
            try:
                active_users = list(activities.exclude(user__isnull=True).values(
                    'user__email', 'user__first_name', 'user__last_name'
                ).annotate(count=Count('id')).order_by('-count')[:5])
            except Exception as e:
                logger.error(f"Error getting active users: {e}")
                active_users = []
            
            response_data = {
                'total_activities': total_activities,
                'recent_activities': recent_count,
                'activities_by_type': by_type,
                'daily_stats': list(reversed(daily_stats)),
                'most_active_users': active_users
            }
            
            logger.info(f"Returning stats: {response_data}")
            return Response(response_data)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in building_activity_stats: {e}", exc_info=True)
            return Response(
                {'error': f'Error getting building stats: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='log')
    def log_activity(self, request):
        """Manually log a building activity"""
        serializer = BuildingActivityCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            activity = serializer.save()
            response_serializer = BuildingActivitySerializer(activity, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='action-types')
    def action_types(self, request):
        """Get all available action types"""
        return Response([
            {'value': value, 'label': label}
            for value, label in BuildingActivity.ACTION_TYPES
        ])
