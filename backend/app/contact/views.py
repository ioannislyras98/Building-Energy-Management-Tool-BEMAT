from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.views import APIView
from .models import Contact
from .serializers import ContactSerializer, ContactCreateSerializer
from building.models import Building
from django.shortcuts import get_object_or_404
from common.utils import is_admin_user, has_access_permission

# Create your views here.

class ContactListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContactCreateSerializer
        return ContactSerializer

    def get_queryset(self):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)
        
        # Check if user has access permission to the building
        if not has_access_permission(self.request.user, building):
            return Contact.objects.none() # Return empty queryset if no permission
            
        if is_admin_user(self.request.user):
            # Admin can see all contacts for the building
            return Contact.objects.filter(building=building)
        else:
            # Regular users can only see contacts they created
            return Contact.objects.filter(building=building, user=self.request.user)

    def perform_create(self, serializer):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)
        
        # Check if user has access permission to create contact for this building
        if not has_access_permission(self.request.user, building):
            return Response({"error": "You do not have permission to add a contact to this building."},
                            status=status.HTTP_403_FORBIDDEN)
                            
        serializer.save(building=building, user=self.request.user)

# Προς το παρόν, το frontend καλεί ένα συγκεκριμένο /create/ endpoint.
# Θα μπορούσαμε να το ενσωματώσουμε στο παραπάνω view ή να έχουμε ένα ξεχωριστό.
# Για συμβατότητα με το frontend, ας φτιάξουμε ένα view που χειρίζεται το POST στο /create/

class ContactCreateForBuildingView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactCreateSerializer

    def create(self, request, *args, **kwargs):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)

        if building.project.user != request.user:
            return Response(
                {"error": "You don't have permission to add contacts to this building."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save(building=building)
        # Επιστροφή του πλήρους ContactSerializer για να έχει το frontend όλα τα δεδομένα
        return Response(ContactSerializer(contact).data, status=status.HTTP_201_CREATED)

# Προαιρετικά: Views για Retrieve, Update, Delete μιας επαφής
class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()
    lookup_field = 'uuid' # ή pk αν χρησιμοποιείτε ID

    def get_queryset(self):
        # Διασφάλιση ότι ο χρήστης έχει πρόσβαση μόνο στις δικές του επαφές (μέσω του project του κτιρίου)
        user = self.request.user
        return Contact.objects.filter(building__project__user=user)

class ContactDeleteView(APIView):
    """
    View for deleting a contact associated with a building.
    """
    def delete(self, request, building_uuid, contact_uuid, *args, **kwargs):
        try:
            # Verify the building exists
            building = Building.objects.get(uuid=building_uuid)
            
            # Find the contact that belongs to this building
            contact = Contact.objects.get(uuid=contact_uuid, building=building)
            
            # Perform deletion
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
            # Verify building exists
            building = Building.objects.get(uuid=building_uuid)
            
            # Get the contact that belongs to this building
            contact = Contact.objects.get(uuid=contact_uuid, building=building)
            
            # Get the data from request
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
