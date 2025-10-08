from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
import json
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
from materials.serializers import MaterialListSerializer
from common.utils import is_admin_user, has_access_permission


# Get available materials for roof thermal insulation
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
            # Admin can see all roof thermal insulation records
            return RoofThermalInsulation.objects.all()
        else:
            # Regular users can only see their own records
            return RoofThermalInsulation.objects.filter(created_by=self.request.user)


class RoofThermalInsulationCreateView(generics.CreateAPIView):
    """Create a new roof thermal insulation"""
    serializer_class = RoofThermalInsulationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            print(f"Roof thermal insulation create request data: {request.data}")
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error creating roof thermal insulation: {e}")
            import traceback
            traceback.print_exc()
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
        return RoofThermalInsulation.objects.filter(created_by=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roof_thermal_insulations_by_building(request, building_uuid):
    """Get all roof thermal insulations for a specific building"""
    try:
        building = get_object_or_404(Building, uuid=building_uuid, project__user=request.user)
        roof_thermal_insulations = RoofThermalInsulation.objects.filter(
            building=building, 
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
        
        # Get new materials for calculation
        new_materials = roof_thermal_insulation.material_layers.filter(material_type='new')
        
        if not new_materials.exists():
            return Response({
                "success": False,
                "error": "Δεν υπάρχουν νέα υλικά για υπολογισμό"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate thermal resistance for roof
        # Φόρτωση θερμικών αντιστάσεων επιφάνειας από τη βάση
        R_si = NumericValue.get_value('Εσωτερική Οροφής (Rsi)')
        R_se = NumericValue.get_value('Εξωτερική (Rse)')
        
        # Calculate resistance of materials
        R_materials = sum([
            material.thickness / material.material_thermal_conductivity 
            for material in new_materials 
            if material.material_thermal_conductivity > 0
        ])
        
        # Total thermal resistance
        R_total = R_si + R_se + R_materials
        
        # Calculate U coefficient
        u_coefficient = 1 / R_total if R_total > 0 else 0
        
        # Update the roof thermal insulation
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


# Material Layer Views
class RoofThermalInsulationMaterialLayerCreateView(generics.CreateAPIView):
    """Create a new material layer for roof thermal insulation"""
    serializer_class = RoofThermalInsulationMaterialLayerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get thermal_insulation_uuid from URL kwargs if present
        if 'thermal_insulation_uuid' in self.kwargs:
            roof_thermal_insulation = get_object_or_404(
                RoofThermalInsulation,
                uuid=self.kwargs['thermal_insulation_uuid'],
                created_by=self.request.user
            )
            serializer.save(roof_thermal_insulation=roof_thermal_insulation)
        else:
            # Verify that the roof thermal insulation belongs to the user
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
        
        # Trigger recalculation by saving
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
