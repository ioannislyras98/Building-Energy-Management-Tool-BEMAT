from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import json
import logging

from numericValues.models import NumericValue
from .models import RoofThermalInsulation, RoofThermalInsulationMaterialLayer
from .serializer import (
    RoofThermalInsulationSerializer,
    RoofThermalInsulationListSerializer,
    RoofThermalInsulationMaterialLayerSerializer
)
from building.models import Building
from project.models import Project
from materials.models import Material

logger = logging.getLogger(__name__)
from materials.serializers import MaterialListSerializer
from common.utils import is_admin_user, has_access_permission


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_materials(request):
    """Get all available materials for roof thermal insulation"""
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


class RoofThermalInsulationListView(generics.ListAPIView):
    """List all roof thermal insulations for the authenticated user"""
    serializer_class = RoofThermalInsulationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return RoofThermalInsulation.objects.all()
        else:
            return RoofThermalInsulation.objects.filter(created_by=self.request.user)


class RoofThermalInsulationCreateView(generics.CreateAPIView):
    """Create a new roof thermal insulation"""
    serializer_class = RoofThermalInsulationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        logger.debug(f"Performing roof thermal insulation creation by user: {self.request.user.email}")
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Roof thermal insulation creation request by user: {request.user.email}")
            logger.debug(f"Request data: {request.data}")
            response = super().create(request, *args, **kwargs)
            logger.info(f"Roof thermal insulation created successfully by user: {request.user.email}")
            return response
        except Exception as e:
            logger.error(f"Error creating roof thermal insulation: {str(e)}", exc_info=True)
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class RoofThermalInsulationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific roof thermal insulation"""
    serializer_class = RoofThermalInsulationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return RoofThermalInsulation.objects.all()
        return RoofThermalInsulation.objects.filter(created_by=self.request.user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_roof_thermal_insulations_by_building(request, building_uuid):
    """Get or create roof thermal insulation for a specific building"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response(
                {"detail": "You don't have permission to access this building."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # GET: Retrieve existing records
        if request.method == 'GET':
            if is_admin_user(request.user):
                roof_thermal_insulations = RoofThermalInsulation.objects.filter(building=building)
            else:
                roof_thermal_insulations = RoofThermalInsulation.objects.filter(
                    building=building, 
                    created_by=request.user
                )
            serializer = RoofThermalInsulationSerializer(roof_thermal_insulations, many=True)
            return Response({
                "success": True,
                "data": serializer.data
            })
        
        # POST: Get or create record
        elif request.method == 'POST':
            project_uuid = request.data.get('project')
            if not project_uuid:
                return Response({
                    "success": False,
                    "error": "Project UUID is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            project = get_object_or_404(Project, uuid=project_uuid)
            
            # Try to get existing record first
            roof_thermal_insulation, created = RoofThermalInsulation.objects.get_or_create(
                building=building,
                created_by=request.user,
                defaults={
                    'project': project,
                    'u_coefficient': 0,
                    'winter_hourly_losses': 0,
                    'summer_hourly_losses': 0,
                    'heating_hours_per_year': 0,
                    'cooling_hours_per_year': 0,
                    'total_cost': 0,
                    'annual_benefit': 0,
                    'time_period_years': 20,
                    'annual_operating_costs': 0,
                    'discount_rate': 5.0,
                    'net_present_value': 0,
                }
            )
            
            serializer = RoofThermalInsulationSerializer(roof_thermal_insulation)
            return Response({
                "success": True,
                "data": serializer.data,
                "created": created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error in get_roof_thermal_insulations_by_building: {str(e)}", exc_info=True)
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roof_thermal_insulations_by_project(request, project_uuid):
    """Get all roof thermal insulations for a specific project"""
    try:
        project = get_object_or_404(Project, uuid=project_uuid, user=request.user)
        roof_thermal_insulations = RoofThermalInsulation.objects.filter(
            project=project, 
            created_by=request.user
        )
        serializer = RoofThermalInsulationSerializer(roof_thermal_insulations, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_u_coefficient(request, thermal_insulation_uuid):
    """Recalculate U coefficient for roof thermal insulation based on material layers"""
    try:
        roof_thermal_insulation = get_object_or_404(
            RoofThermalInsulation, 
            uuid=thermal_insulation_uuid, 
            created_by=request.user
        )
        
        new_materials = roof_thermal_insulation.material_layers.filter(material_type='new')
        
        if not new_materials.exists():
            return Response({
                "success": False,
                "error": "Δεν υπάρχουν νέα υλικά για υπολογισμό"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        R_si = NumericValue.get_value('Εσωτερική Οροφής (Rsi)')
        R_se = NumericValue.get_value('Εξωτερική (Rse)')
        
        R_materials = sum([
            material.thickness / material.material_thermal_conductivity 
            for material in new_materials 
            if material.material_thermal_conductivity > 0
        ])
        
        R_total = R_si + R_se + R_materials
        
        u_coefficient = 1 / R_total if R_total > 0 else 0
        
        roof_thermal_insulation.u_coefficient = u_coefficient
        roof_thermal_insulation.save()
        
        return Response({
            "success": True,
            "data": {
                "u_coefficient": u_coefficient,
                "r_total": R_total,
                "r_si": R_si,
                "r_se": R_se,
                "r_materials": R_materials
            }
        })
        
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoofThermalInsulationMaterialLayerCreateView(generics.CreateAPIView):
    """Create a new material layer for roof thermal insulation"""
    serializer_class = RoofThermalInsulationMaterialLayerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if 'thermal_insulation_uuid' in self.kwargs:
            roof_thermal_insulation = get_object_or_404(
                RoofThermalInsulation,
                uuid=self.kwargs['thermal_insulation_uuid'],
                created_by=self.request.user
            )
            serializer.save(roof_thermal_insulation=roof_thermal_insulation)
        else:
            roof_thermal_insulation = serializer.validated_data['roof_thermal_insulation']
            if roof_thermal_insulation.created_by != self.request.user:
                raise PermissionError("You don't have permission to add materials to this roof thermal insulation")
            serializer.save()


class RoofThermalInsulationMaterialLayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific material layer"""
    serializer_class = RoofThermalInsulationMaterialLayerSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return RoofThermalInsulationMaterialLayer.objects.filter(
            roof_thermal_insulation__created_by=self.request.user
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_roof_thermal_insulation(request, roof_thermal_insulation_uuid):
    """Manually trigger recalculation of U coefficient, annual benefit, and NPV"""
    try:
        roof_thermal_insulation = get_object_or_404(
            RoofThermalInsulation,
            uuid=roof_thermal_insulation_uuid,
            created_by=request.user
        )
        
        roof_thermal_insulation.save()
        
        serializer = RoofThermalInsulationSerializer(roof_thermal_insulation)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Roof thermal insulation recalculated successfully"
        })
        
    except Exception as e:
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
