from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import Http404

from building.models import Building
from project.models import Project
from common.utils import is_admin_user, has_access_permission
from .models import BoilerReplacement
from .serializer import BoilerReplacementSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_boiler_replacement_by_building(request, building_id):
    """
    Λήψη στοιχείων αντικατάστασης λέβητα για συγκεκριμένο κτίριο
    """
    try:
        # Έλεγχος ότι το κτίριο υπάρχει
        building = get_object_or_404(Building, uuid=building_id)
        
        # Αναζήτηση εγγραφής αντικατάστασης λέβητα
        boiler_replacement = BoilerReplacement.objects.get(building=building)
        
        serializer = BoilerReplacementSerializer(boiler_replacement)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except BoilerReplacement.DoesNotExist:
        return Response(
            {"detail": "Δεν βρέθηκαν στοιχεία αντικατάστασης λέβητα για αυτό το κτίριο"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Σφάλμα κατά την ανάκτηση των δεδομένων: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def boiler_replacement_create(request):
    """
    Δημιουργία ή ενημέρωση στοιχείων αντικατάστασης λέβητα
    """
    try:
        # Λήψη building και project από το request
        building_id = request.data.get('building')
        project_id = request.data.get('project')
        
        if not building_id or not project_id:
            return Response(
                {"detail": "Απαιτούνται τα πεδία building και project"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Έλεγχος ότι το κτίριο και το έργο υπάρχουν
        building = get_object_or_404(Building, uuid=building_id)
        project = get_object_or_404(Project, id=project_id)
        
        # Προσπάθεια εύρεσης υπάρχουσας εγγραφής
        try:
            boiler_replacement = BoilerReplacement.objects.get(building=building)
            # Ενημέρωση υπάρχουσας εγγραφής
            serializer = BoilerReplacementSerializer(
                boiler_replacement, 
                data=request.data, 
                partial=True
            )
        except BoilerReplacement.DoesNotExist:
            # Δημιουργία νέας εγγραφής
            serializer = BoilerReplacementSerializer(data=request.data)
        
        if serializer.is_valid():
            boiler_replacement = serializer.save()
            return Response(
                BoilerReplacementSerializer(boiler_replacement).data,
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"detail": "Σφάλμα επικύρωσης δεδομένων", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {"detail": f"Σφάλμα κατά την αποθήκευση: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
