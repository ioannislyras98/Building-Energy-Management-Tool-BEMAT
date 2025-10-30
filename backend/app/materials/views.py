from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import logging

from .models import Material
from .serializers import MaterialSerializer, MaterialListSerializer

logger = logging.getLogger(__name__)


class MaterialListCreateView(generics.ListCreateAPIView):
    queryset = Material.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MaterialListSerializer
        return MaterialSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]


class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'uuid'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_materials_by_category(request, category):
    """Get all materials for a specific category"""
    try:
        materials = Material.objects.filter(category=category, is_active=True)
        serializer = MaterialListSerializer(materials, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "count": len(serializer.data)
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_active_materials(request):
    """Get all active materials"""
    try:
        materials = Material.objects.filter(is_active=True)
        serializer = MaterialListSerializer(materials, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "count": len(serializer.data)
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_material_categories(request):
    """Get all available material categories"""
    try:
        categories = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in Material.MATERIAL_CATEGORY_CHOICES
        ]
        return Response({
            "success": True,
            "data": categories,
            "count": len(categories)
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_materials_admin(request):
    """Get all materials for admin (including inactive ones)"""
    try:
        materials = Material.objects.all().order_by('category', 'name')
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
