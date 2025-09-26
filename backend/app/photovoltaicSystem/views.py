from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import PhotovoltaicSystem
from .serializer import PhotovoltaicSystemSerializer, PhotovoltaicSystemCreateSerializer
from common.utils import is_admin_user, has_access_permission

class PhotovoltaicSystemListCreateView(generics.ListCreateAPIView):
    """
    GET: Λίστα φωτοβολταϊκών συστημάτων
    POST: Δημιουργία νέου φωτοβολταϊκού συστήματος
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if is_admin_user(user):
            # Admin can see all photovoltaic systems
            queryset = PhotovoltaicSystem.objects.all().select_related(
                'building', 'project', 'user'
            ).order_by('-created_at')
        else:
            # Regular users can only see their own systems
            queryset = PhotovoltaicSystem.objects.filter(user=user).select_related(
                'building', 'project', 'user'
            ).order_by('-created_at')
        
        # Φιλτράρισμα ανά κτίριο
        building_id = self.request.query_params.get('building', None)
        if building_id:
            queryset = queryset.filter(building__uuid=building_id)
        
        # Φιλτράρισμα ανά έργο
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project__uuid=project_id)
        
        # Αναζήτηση
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(building__name__icontains=search) |
                Q(project__name__icontains=search) |
                Q(pv_system_type__icontains=search) |
                Q(pv_usage__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PhotovoltaicSystemCreateSerializer
        return PhotovoltaicSystemSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create to return full data with calculated fields"""
        serializer = PhotovoltaicSystemCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Save the instance with the user
            instance = serializer.save(user=request.user)
            
            # Return the full data using the main serializer with calculated fields
            response_serializer = PhotovoltaicSystemSerializer(instance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PhotovoltaicSystemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Λεπτομέρειες φωτοβολταϊκού συστήματος
    PUT/PATCH: Ενημέρωση φωτοβολταϊκού συστήματος
    DELETE: Διαγραφή φωτοβολταϊκού συστήματος
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    
    def get_queryset(self):
        if is_admin_user(self.request.user):
            # Admin can access all photovoltaic systems
            return PhotovoltaicSystem.objects.all().select_related(
                'building', 'project', 'user'
            )
        else:
            # Regular users can only access their own systems
            return PhotovoltaicSystem.objects.filter(user=self.request.user).select_related(
                'building', 'project', 'user'
            )
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions and return full data"""
        instance = self.get_object()
        
        # Check if user can update this system (admin or owner)
        if not is_admin_user(request.user) and instance.user != request.user:
            return Response(
                {"error": "Access denied - you can only update your own systems"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Use the create serializer for input validation
        serializer = PhotovoltaicSystemCreateSerializer(instance, data=request.data, partial=kwargs.get('partial', False))
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Return the full data using the main serializer with calculated fields
            response_serializer = PhotovoltaicSystemSerializer(updated_instance)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        
        # Check if user can delete this system (admin or owner)
        if not is_admin_user(request.user) and instance.user != request.user:
            return Response(
                {"error": "Access denied - you can only delete your own systems"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    def get_serializer_class(self):
        # Always use the main serializer for detail view (GET)
        return PhotovoltaicSystemSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def photovoltaic_system_summary(request):
    """
    Στατιστικά για φωτοβολταϊκά συστήματα χρήστη
    """
    user = request.user
    systems = PhotovoltaicSystem.objects.filter(user=user)
    
    total_systems = systems.count()
    total_cost = sum(system.total_cost or 0 for system in systems)
    total_power = sum(
        (system.pv_panels_quantity or 0) * (system.power_per_panel or 0) 
        for system in systems
    )
    
    # Ομαδοποίηση ανά τύπο συστήματος
    system_types = {}
    for system in systems:
        system_type = system.pv_system_type or 'Άγνωστο'
        if system_type not in system_types:
            system_types[system_type] = 0
        system_types[system_type] += 1
    
    # Ομαδοποίηση ανά χρήση
    usage_types = {}
    for system in systems:
        usage = system.pv_usage or 'Άγνωστο'
        if usage not in usage_types:
            usage_types[usage] = 0
        usage_types[usage] += 1
    
    return Response({
        'total_systems': total_systems,
        'total_cost': total_cost,
        'total_power': total_power,
        'system_types': system_types,
        'usage_types': usage_types,
        'average_cost_per_system': total_cost / total_systems if total_systems > 0 else 0,
        'average_power_per_system': total_power / total_systems if total_systems > 0 else 0,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_photovoltaic_costs(request):
    """
    Υπολογισμός κόστους φωτοβολταϊκού συστήματος
    """
    data = request.data
    
    # Υπολογισμός κόστους για κάθε κατηγορία εξοπλισμού
    costs = {}
    
    # Φωτοβολταϊκά πλαίσια
    if data.get('pv_panels_quantity') and data.get('pv_panels_unit_price'):
        costs['pv_panels_cost'] = float(data['pv_panels_quantity']) * float(data['pv_panels_unit_price'])
    
    # Μεταλλικές βάσεις στήριξης
    if data.get('metal_bases_quantity') and data.get('metal_bases_unit_price'):
        costs['metal_bases_cost'] = float(data['metal_bases_quantity']) * float(data['metal_bases_unit_price'])
    
    # Σωληνώσεις
    if data.get('piping_quantity') and data.get('piping_unit_price'):
        costs['piping_cost'] = float(data['piping_quantity']) * float(data['piping_unit_price'])
    
    # Καλωδιώσεις
    if data.get('wiring_quantity') and data.get('wiring_unit_price'):
        costs['wiring_cost'] = float(data['wiring_quantity']) * float(data['wiring_unit_price'])
    
    # Μετατροπέας ισχύος
    if data.get('inverter_quantity') and data.get('inverter_unit_price'):
        costs['inverter_cost'] = float(data['inverter_quantity']) * float(data['inverter_unit_price'])
    
    # Εγκατάσταση
    if data.get('installation_quantity') and data.get('installation_unit_price'):
        costs['installation_cost'] = float(data['installation_quantity']) * float(data['installation_unit_price'])
    
    # Συνολικό κόστος εξοπλισμού
    total_equipment_cost = sum(costs.values())
    
    # Οικονομικοί υπολογισμοί
    unexpected_expenses = total_equipment_cost * 0.09  # 9%
    value_after_unexpected = total_equipment_cost + unexpected_expenses
    tax_burden = value_after_unexpected * 0.24  # 24%
    total_cost = value_after_unexpected + tax_burden
    
    return Response({
        'equipment_costs': costs,
        'total_equipment_cost': total_equipment_cost,
        'unexpected_expenses': unexpected_expenses,
        'value_after_unexpected': value_after_unexpected,
        'tax_burden': tax_burden,
        'total_cost': total_cost,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def photovoltaic_systems_by_building(request, building_uuid):
    """
    Φωτοβολταϊκά συστήματα ανά κτίριο
    """
    user = request.user
    systems = PhotovoltaicSystem.objects.filter(
        user=user, 
        building__uuid=building_uuid
    ).select_related('building', 'project', 'user')
    
    serializer = PhotovoltaicSystemSerializer(systems, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def photovoltaic_systems_by_project(request, project_uuid):
    """
    Φωτοβολταϊκά συστήματα ανά έργο
    """
    user = request.user
    systems = PhotovoltaicSystem.objects.filter(
        user=user, 
        project__uuid=project_uuid
    ).select_related('building', 'project', 'user')
    
    serializer = PhotovoltaicSystemSerializer(systems, many=True)
    return Response(serializer.data)
