from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from building.models import Building
from project.models import Project
from energyConsumption.models import EnergyConsumption
from common.utils import is_admin_user, has_access_permission
from .models import NaturalGasNetwork
from .serializer import NaturalGasNetworkSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_natural_gas_network(request):
    """
    Create a new natural gas network entry
    """
    try:
        data = request.data.copy()
        
        building_id = data.get('building')
        if not building_id:
            return Response({
                'success': False,
                'error': 'Building ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        building = get_object_or_404(Building, uuid=building_id)
        
        project = None
        project_id = data.get('project')
        if project_id:
            project = get_object_or_404(Project, uuid=project_id)
        
        with transaction.atomic():
            total_annual_cost = 0
            # Υπολογίζουμε λίτρα πετρελαίου χ τιμή ανά λίτρο
            energy_consumptions = EnergyConsumption.objects.filter(
                building=building,
                energy_source='heating_oil'
            )
            if energy_consumptions.exists():
                oil_price_per_liter = 1.0  # Προεπιλογή
                
                if project:
                    if project.oil_price_per_liter:
                        oil_price_per_liter = float(project.oil_price_per_liter)
                elif building.project:
                    if building.project.oil_price_per_liter:
                        oil_price_per_liter = float(building.project.oil_price_per_liter)
                
                for consumption in energy_consumptions:
                    liters = float(consumption.quantity or 0)
                    total_annual_cost += liters * oil_price_per_liter
            
            if 'current_energy_cost_per_year' not in data or not data['current_energy_cost_per_year']:
                data['current_energy_cost_per_year'] = round(total_annual_cost, 2)
            
            existing_network = NaturalGasNetwork.objects.filter(building=building).first()
            
            data['building'] = building.pk
            if project:
                data['project'] = project.pk
            
            if existing_network:
                serializer = NaturalGasNetworkSerializer(existing_network, data=data, partial=True)
                if serializer.is_valid():
                    network = serializer.save()
                    logger.info(f"Natural gas network updated for building {building.name}")
                    return Response({
                        'success': True,
                        'message': 'Natural gas network updated successfully',
                        'data': serializer.data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'error': 'Validation failed',
                        'details': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = NaturalGasNetworkSerializer(data=data)
                if serializer.is_valid():
                    network = serializer.save()
                    logger.info(f"Natural gas network created for building {building.name}")
                    return Response({
                        'success': True,
                        'message': 'Natural gas network created successfully',
                        'data': serializer.data
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        'success': False,
                        'error': 'Validation failed',
                        'details': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error creating natural gas network: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_natural_gas_networks_by_building(request, building_uuid):
    """
    Get all natural gas networks for a specific building
    """
    try:
        building = get_object_or_404(Building, uuid=building_uuid)
        
        if not has_access_permission(request.user, building):
            return Response({
                'success': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        networks = NaturalGasNetwork.objects.filter(building=building).order_by('-created_at')
        
        if networks.exists():
            serializer = NaturalGasNetworkSerializer(networks, many=True)
            data = serializer.data
            
            # Υπολογίζουμε λίτρα πετρελαίου χ τιμή ανά λίτρο
            energy_consumptions = EnergyConsumption.objects.filter(
                building=building,
                energy_source='heating_oil'
            )
            if energy_consumptions.exists():
                total_annual_cost = 0
                project = building.project
                oil_price_per_liter = 1.0
                
                if project:
                    if project.oil_price_per_liter:
                        oil_price_per_liter = float(project.oil_price_per_liter)
                
                for consumption in energy_consumptions:
                    liters = float(consumption.quantity or 0)
                    total_annual_cost += liters * oil_price_per_liter
                
                for item in data:
                    # Επαναϋπολογίζουμε πάντα με τις τρέχουσες τιμές του Project
                    network_obj = networks.filter(uuid=item['uuid']).first()
                    if network_obj:
                        # Το save() επαναϋπολογίζει ΟΛΑ τα πεδία με τις τρέχουσες τιμές
                        network_obj.save()
                        
                        # Ενημερώνουμε τα δεδομένα που επιστρέφουμε
                        item['current_energy_cost_per_year'] = network_obj.current_energy_cost_per_year
                        item['natural_gas_cost_per_year'] = network_obj.natural_gas_cost_per_year
                        item['annual_energy_savings'] = network_obj.annual_energy_savings
                        item['annual_economic_benefit'] = network_obj.annual_economic_benefit
                        item['payback_period'] = network_obj.payback_period
                        item['net_present_value'] = network_obj.net_present_value
                        item['internal_rate_of_return'] = network_obj.internal_rate_of_return
            
            return Response({
                'success': True,
                'data': data,
                'count': networks.count()
            }, status=status.HTTP_200_OK)
        else:
            total_annual_cost = 0
            # Υπολογίζουμε λίτρα πετρελαίου χ τιμή ανά λίτρο
            energy_consumptions = EnergyConsumption.objects.filter(
                building=building,
                energy_source='heating_oil'
            )
            if energy_consumptions.exists():
                project = building.project
                oil_price_per_liter = 1.0 
                
                if project:
                    if project.oil_price_per_liter:
                        oil_price_per_liter = float(project.oil_price_per_liter)
                
                for consumption in energy_consumptions:
                    liters = float(consumption.quantity or 0)
                    total_annual_cost += liters * oil_price_per_liter
            
            return Response({
                'success': True,
                'data': [],
                'count': 0,
                'current_energy_cost_per_year': round(total_annual_cost, 2),
                'message': 'No natural gas networks found for this building'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error retrieving natural gas networks for building {building_uuid}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_natural_gas_network_detail(request, network_uuid):
    """
    Get detailed information about a specific natural gas network
    """
    try:
        network = get_object_or_404(NaturalGasNetwork, uuid=network_uuid)
        serializer = NaturalGasNetworkSerializer(network)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error retrieving natural gas network {network_uuid}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_natural_gas_network(request, network_uuid):
    """
    Update a specific natural gas network
    """
    try:
        network = get_object_or_404(NaturalGasNetwork, uuid=network_uuid)
        
        with transaction.atomic():
            serializer = NaturalGasNetworkSerializer(network, data=request.data, partial=True)
            if serializer.is_valid():
                updated_network = serializer.save()
                logger.info(f"Natural gas network {network_uuid} updated successfully")
                return Response({
                    'success': True,
                    'message': 'Natural gas network updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error updating natural gas network {network_uuid}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_natural_gas_network(request, network_uuid):
    """
    Delete a specific natural gas network
    """
    try:
        network = get_object_or_404(NaturalGasNetwork, uuid=network_uuid)
        building_name = network.building.name if network.building else 'Unknown'
        
        with transaction.atomic():
            network.delete()
            logger.info(f"Natural gas network {network_uuid} deleted successfully")
            return Response({
                'success': True,
                'message': f'Natural gas network for {building_name} deleted successfully'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error deleting natural gas network {network_uuid}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_prices(request, network_uuid):
    """
    Ενημερώνει τις τιμές του Natural Gas Network με τις τρέχουσες τιμές από το Project:
    - Τιμή πετρελαίου (oil_price_per_liter)
    - Τιμή φυσικού αερίου (natural_gas_price_per_m3)
    Και επαναϋπολογίζει όλα τα οικονομικά στοιχεία
    """
    try:
        network = get_object_or_404(NaturalGasNetwork, uuid=network_uuid)
        
        if not has_access_permission(request.user, network.building):
            return Response({
                'success': False,
                'message': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        project = network.project or network.building.project
        
        # Επαναϋπολογισμός όλων των πεδίων (ενημερώνει και τις τιμές από το Project)
        network.save()
        
        # Πληροφορίες τιμών (από το μοντέλο μετά το save)
        price_info = {
            'oil_price_per_liter': float(project.oil_price_per_liter) if project and project.oil_price_per_liter else None,
            'natural_gas_price_per_m3': float(network.natural_gas_price_per_kwh) if network.natural_gas_price_per_kwh else None,
        }
        
        serializer = NaturalGasNetworkSerializer(network)
        
        logger.info(f"Prices refreshed for Natural Gas Network {network_uuid}")
        
        return Response({
            'success': True,
            'message': 'Οι τιμές ενημερώθηκαν επιτυχώς',
            'price_info': price_info,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error refreshing prices for network {network_uuid}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Σφάλμα κατά την ενημέρωση τιμών',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_natural_gas_networks(request):
    """
    Get all natural gas networks with optional filtering
    """
    try:
        networks = NaturalGasNetwork.objects.all().order_by('-created_at')
        
        building_id = request.GET.get('building')
        project_id = request.GET.get('project')
        
        if building_id:
            networks = networks.filter(building_id=building_id)
        
        if project_id:
            networks = networks.filter(project_id=project_id)
        
        serializer = NaturalGasNetworkSerializer(networks, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': networks.count()
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error retrieving all natural gas networks: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
