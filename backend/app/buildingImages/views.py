from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import BuildingImage
from .serializers import BuildingImageSerializer, BuildingImageListSerializer, BuildingImageCreateUpdateSerializer
from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission


class BuildingImageViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter images by building and project if provided"""
        queryset = BuildingImage.objects.all()
        
        building_uuid = self.request.query_params.get('building', None)
        project_uuid = self.request.query_params.get('project', None)
        category = self.request.query_params.get('category', None)
        
        if building_uuid:
            queryset = queryset.filter(building__uuid=building_uuid)
        
        if project_uuid:
            queryset = queryset.filter(project__uuid=project_uuid)
            
        if category:
            queryset = queryset.filter(category=category)
        
        # Apply user filtering unless admin
        if not is_admin_user(self.request.user):
            # Regular users can only see their own images
            queryset = queryset.filter(user=self.request.user)
        
        return queryset.order_by('-uploaded_at')
    
    def get_serializer_class(self):
        """Use appropriate serializer for different actions"""
        if self.action == 'list':
            return BuildingImageListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BuildingImageCreateUpdateSerializer
        return BuildingImageSerializer
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions"""
        instance = self.get_object()
        
        # Check if user can update this image (admin or owner)
        if not is_admin_user(request.user) and instance.user != request.user:
            return Response(
                {"error": "Access denied - you can only update your own images"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to check permissions"""
        instance = self.get_object()
        
        # Check if user can update this image (admin or owner)
        if not is_admin_user(request.user) and instance.user != request.user:
            return Response(
                {"error": "Access denied - you can only update your own images"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        
        # Check if user can delete this image (admin or owner)
        if not is_admin_user(request.user) and instance.user != request.user:
            return Response(
                {"error": "Access denied - you can only delete your own images"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], url_path='building/(?P<building_uuid>[^/.]+)')
    def by_building(self, request, building_uuid=None):
        """Get all images for a specific building"""
        try:
            building = get_object_or_404(Building, uuid=building_uuid)
            
            if not has_access_permission(request.user, building):
                return Response(
                    {"error": "Access denied"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if is_admin_user(request.user):
                # Admin can see all images for the building
                images = BuildingImage.objects.filter(building=building).order_by('-uploaded_at')
            else:
                # Regular users can only see their own images
                images = BuildingImage.objects.filter(building=building, user=request.user).order_by('-uploaded_at')
            
            # Optional category filter
            category = request.query_params.get('category', None)
            if category:
                images = images.filter(category=category)
            
            serializer = BuildingImageSerializer(images, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Building.DoesNotExist:
            return Response(
                {"error": "Building not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_image(self, request):
        """Upload a new image"""
        serializer = BuildingImageCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Verify building and project exist and belong to user
            building_uuid = request.data.get('building')
            project_uuid = request.data.get('project')
            
            try:
                building = Building.objects.get(uuid=building_uuid)
                project = Project.objects.get(uuid=project_uuid)
                
                # You might want to add permission checks here
                # to ensure the user can upload images to this building/project
                
                instance = serializer.save()
                # Return the full serializer data
                response_serializer = BuildingImageSerializer(instance, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except (Building.DoesNotExist, Project.DoesNotExist):
                return Response(
                    {"error": "Invalid building or project"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        """Custom create logic if needed"""
        serializer.save()
    
    def perform_update(self, serializer):
        """Custom update logic if needed"""
        serializer.save()
    
    @action(detail=False, methods=['get'], url_path='categories')
    def get_categories(self, request):
        """Get available image categories"""
        categories = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in BuildingImage.CATEGORY_CHOICES
        ]
        return Response(categories)
    
    @action(detail=False, methods=['get'], url_path='search')
    def search_images(self, request):
        """Search images by title, description, or tags"""
        query = request.query_params.get('q', '')
        building_uuid = request.query_params.get('building', None)
        
        if not query:
            return Response({"error": "Query parameter 'q' is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = BuildingImage.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__icontains=query)
        )
        
        if building_uuid:
            queryset = queryset.filter(building__uuid=building_uuid)
        
        serializer = BuildingImageSerializer(queryset, many=True)
        return Response(serializer.data)
