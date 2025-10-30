from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
import logging

from .models import EnergyConsumption
from .serializers import EnergyConsumptionSerializer
from common.utils import is_admin_user, has_access_permission
from building.models import Building
from project.models import Project

logger = logging.getLogger(__name__)

class CreateEnergyConsumption(generics.CreateAPIView):
    queryset = EnergyConsumption.objects.all()
    serializer_class = EnergyConsumptionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UpdateEnergyConsumption(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, uuid):
        try:
            energy_profile = EnergyConsumption.objects.get(uuid=uuid)
        except EnergyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not is_admin_user(request.user) and energy_profile.user != request.user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = EnergyConsumptionSerializer(energy_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DeleteEnergyConsumption(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, uuid):
        try:
            energy_profile = EnergyConsumption.objects.get(uuid=uuid)
        except EnergyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not is_admin_user(request.user) and energy_profile.user != request.user:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        energy_profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
class GetEnergyConsumptionByBuilding(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, building_id):
        try:
            building = Building.objects.get(uuid=building_id)
        except Building.DoesNotExist:
            return Response({"detail": "Building not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, building):
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
        if is_admin_user(request.user):
            profiles = EnergyConsumption.objects.filter(building_id=building_id)
        else:
            profiles = EnergyConsumption.objects.filter(building_id=building_id, user=request.user)
            
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class GetEnergyConsumptionByProject(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, project_id):
        try:
            project = Project.objects.get(uuid=project_id)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if not has_access_permission(request.user, project):
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
        if is_admin_user(request.user):
            profiles = EnergyConsumption.objects.filter(project_id=project_id)
        else:
            profiles = EnergyConsumption.objects.filter(project_id=project_id, user=request.user)
            
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class GetEnergyConsumptionByUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        if str(request.user.uuid) != user_id and not is_admin_user(request.user):
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
        profiles = EnergyConsumption.objects.filter(user_id=user_id)
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class GetEnergyConsumptionByUUID(APIView):
    def get(self, request, uuid):
        try:
            energy_profile = EnergyConsumption.objects.get(uuid=uuid)
        except EnergyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EnergyConsumptionSerializer(energy_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)