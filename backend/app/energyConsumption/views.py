from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import energyConsumption
from .serializers import EnergyConsumptionSerializer

# Create a new EnergyProfile
class CreateEnergyConsumption(APIView):
    def post(self, request):
        serializer = EnergyConsumptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # You may need to set user from request.user if applicable
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# Update an existing EnergyProfile identified by uuid
class UpdateEnergyConsumption(APIView):
    def put(self, request, uuid):
        try:
            energy_profile = energyConsumption.objects.get(uuid=uuid)
        except energyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = EnergyConsumptionSerializer(energy_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# Delete an EnergyProfile identified by uuid
class DeleteEnergyConsumption(APIView):
    def delete(self, request, uuid):
        try:
            energy_profile = energyConsumption.objects.get(uuid=uuid)
        except energyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        energy_profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
# Retrieve all EnergyProfiles for a given building (by building uuid)
class GetEnergyConsumptionByBuilding(APIView):
    def get(self, request, building_id):
        profiles = energyConsumption.objects.filter(building_id=building_id)
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
# Retrieve EnergyProfiles by project (by project uuid)
class GetEnergyConsumptionByProject(APIView):
    def get(self, request, project_id):
        profiles = energyConsumption.objects.filter(project_id=project_id)
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
# Retrieve EnergyProfiles by user (by user uuid)
class GetEnergyConsumptionByUser(APIView):
    def get(self, request, user_id):
        profiles = energyConsumption.objects.filter(user_id=user_id)
        serializer = EnergyConsumptionSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
# Retrieve a single EnergyProfile by its uuid
class GetEnergyConsumptionByUUID(APIView):
    def get(self, request, uuid):
        try:
            energy_profile = energyConsumption.objects.get(uuid=uuid)
        except energyConsumption.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EnergyConsumptionSerializer(energy_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)