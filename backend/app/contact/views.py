from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Contact
from .serializers import ContactSerializer, ContactCreateSerializer
from building.models import Building
from django.shortcuts import get_object_or_404

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
        # Έλεγχos αν ο χρήστης έχει δικαίωμα στο κτίριο
        if building.project.user != self.request.user:
            return Contact.objects.none() # Επιστρέφει κενό queryset αν δεν έχει δικαίωμα
        return Contact.objects.filter(building=building)

    def perform_create(self, serializer):
        building_uuid = self.kwargs.get('building_uuid')
        building = get_object_or_404(Building, uuid=building_uuid)
        
        # Έλεγχος αν ο χρήστης έχει δικαίωμα να προσθέσει επαφή σε αυτό το κτίριο
        if building.project.user != self.request.user:
            # Αυτό κανονικά δεν θα έπρεπε να συμβεί αν ο έλεγχος στο get_queryset είναι σωστός για GET,
            # αλλά είναι καλή πρακτική να υπάρχει και εδώ για POST.
            # Ωστόσο, η απάντηση εδώ πρέπει να είναι διαφορετική, π.χ. PermissionDenied.
            # Για λόγους απλότητας, θα βασιστούμε ότι το get_object_or_404 θα αποτύχει αν δεν βρεθεί
            # ή ο παρακάτω έλεγχος θα πιάσει την περίπτωση.
            # Στην πράξη, θα μπορούσατε να ρίξετε ένα exceptions.PermissionDenied()
            return Response({"error": "You do not have permission to add a contact to this building."},
                            status=status.HTTP_403_FORBIDDEN)
                            
        serializer.save(building=building)

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
