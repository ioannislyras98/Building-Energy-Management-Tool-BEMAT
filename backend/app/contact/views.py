from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.views import APIView
import logging

from .models import Contact
from .serializers import ContactSerializer, ContactCreateSerializer
from building.models import Building
from django.shortcuts import get_object_or_404
from common.utils import is_admin_user, has_access_permission

logger = logging.getLogger(__name__)


class ContactListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContactCreateSerializer
        return ContactSerializer

    def get_queryset(self):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(self.request.user, building):
            return Contact.objects.none() 
            
        if is_admin_user(self.request.user):
            return Contact.objects.filter(building=building)
        else:
            return Contact.objects.filter(building=building, user=self.request.user)

    def perform_create(self, serializer):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(self.request.user, building):
            return Response({"error": "You do not have permission to add a contact to this building."},
                            status=status.HTTP_403_FORBIDDEN)
                            
        serializer.save(building=building, user=self.request.user)


class ContactCreateForBuildingView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactCreateSerializer

    def create(self, request, *args, **kwargs):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)

        if not has_access_permission(request.user, building):
            return Response(
                {"error": "You don't have permission to add contacts to this building."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save(building=building)
        return Response(ContactSerializer(contact).data, status=status.HTTP_201_CREATED)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()
    lookup_field = 'uuid'

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return Contact.objects.all()
        return Contact.objects.filter(building__project__user=self.request.user)


class ContactDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, building_uuid, contact_uuid, *args, **kwargs):
        try:
            building = Building.objects.get(uuid=building_uuid)
            
            if not has_access_permission(request.user, building):
                return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
            contact = Contact.objects.get(uuid=contact_uuid, building=building)
            
            if not is_admin_user(request.user) and contact.user != request.user:
                return Response({"error": "Access denied - you can only delete your own contacts."}, status=status.HTTP_403_FORBIDDEN)
            
            contact.delete()
            return Response({"message": "Contact deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Building.DoesNotExist:
            return Response({"error": "Building not found."}, status=status.HTTP_404_NOT_FOUND)
        except Contact.DoesNotExist:
            return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)


class ContactUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, building_uuid, contact_uuid, format=None):
        try:
            building = Building.objects.get(uuid=building_uuid)
            
            if not has_access_permission(request.user, building):
                return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
            
            contact = Contact.objects.get(uuid=contact_uuid, building=building)
            
            if not is_admin_user(request.user) and contact.user != request.user:
                return Response({"error": "Access denied - you can only update your own contacts."}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ContactSerializer(contact, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Building.DoesNotExist:
            return Response({"error": "Building not found"}, status=status.HTTP_404_NOT_FOUND)
        except Contact.DoesNotExist:
            return Response({"error": "Contact not found for this building"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
