from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import json
from .models import (
    ExternalWallThermalInsulation, 
    ThermalInsulationMaterialLayer
)
from .serializer import (
    ExternalWallThermalInsulationSerializer,
    ExternalWallThermalInsulationCreateSerializer,
    ThermalInsulationMaterialLayerSerializer
)
from building.models import Building
from project.models import Project
from materials.models import Material
from materials.serializers import MaterialListSerializer
from common.utils import is_admin_user, has_access_permission


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_materials(request):
    """Get all available materials for thermal insulation"""
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


class ExternalWallThermalInsulationListView(generics.ListAPIView):
    serializer_class = ExternalWallThermalInsulationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return ExternalWallThermalInsulation.objects.all()
        else:
            return ExternalWallThermalInsulation.objects.filter(user=self.request.user)


class ExternalWallThermalInsulationCreateView(generics.CreateAPIView):
    queryset = ExternalWallThermalInsulation.objects.all()
    serializer_class = ExternalWallThermalInsulationCreateSerializer
    permission_classes = [IsAuthenticated]


class ExternalWallThermalInsulationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExternalWallThermalInsulationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return ExternalWallThermalInsulation.objects.all()
        return ExternalWallThermalInsulation.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_thermal_insulations_by_building(request, building_uuid):
    """Get all thermal insulations for a specific building"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response(
                {"detail": "You don't have permission to access this building."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if is_admin_user(request.user):
            thermal_insulations = ExternalWallThermalInsulation.objects.filter(building=building)
        else:
            thermal_insulations = ExternalWallThermalInsulation.objects.filter(
                building=building,
                user=request.user
            )
        
        serializer = ExternalWallThermalInsulationSerializer(thermal_insulations, many=True)
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
def get_thermal_insulations_by_project(request, project_uuid):
    """Get all thermal insulations for a specific project"""
    try:
        project = get_object_or_404(Project, uuid=project_uuid)
        
        if project.user != request.user:
            return Response(
                {"detail": "You don't have permission to access this project."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        thermal_insulations = ExternalWallThermalInsulation.objects.filter(
            project=project,
            user=request.user
        )
        
        serializer = ExternalWallThermalInsulationSerializer(thermal_insulations, many=True)
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


class ThermalInsulationMaterialLayerCreateView(generics.CreateAPIView):
    queryset = ThermalInsulationMaterialLayer.objects.all()
    serializer_class = ThermalInsulationMaterialLayerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print(f"Creating material layer with data: {self.request.data}")
        print(f"UUID from URL: {self.kwargs['thermal_insulation_uuid']}")
        thermal_insulation = get_object_or_404(
            ExternalWallThermalInsulation,
            uuid=self.kwargs['thermal_insulation_uuid'],
            user=self.request.user
        )
        print(f"Found thermal insulation: {thermal_insulation}")
        serializer.save(thermal_insulation=thermal_insulation)


class ThermalInsulationMaterialLayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ThermalInsulationMaterialLayerSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return ThermalInsulationMaterialLayer.objects.filter(
            thermal_insulation__user=self.request.user
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_u_coefficient(request, thermal_insulation_uuid):
    """Manually trigger U coefficient recalculation"""
    try:
        thermal_insulation = get_object_or_404(
            ExternalWallThermalInsulation,
            uuid=thermal_insulation_uuid,
            user=request.user
        )
        
        thermal_insulation.u_coefficient = thermal_insulation.calculate_u_coefficient()
        thermal_insulation.save()
        
        serializer = ExternalWallThermalInsulationSerializer(thermal_insulation)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "U coefficient recalculated successfully"
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
