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
            energy_consumptions = EnergyConsumption.objects.filter(building=building)
            if energy_consumptions.exists():
                electricity_cost_per_kwh = 0.15
                fuel_cost_per_kwh = 0.10
                
                if project:
                    if project.cost_per_kwh_electricity:
                        electricity_cost_per_kwh = float(project.cost_per_kwh_electricity)
                    if project.natural_gas_price_per_m3:
                        fuel_cost_per_kwh = float(project.natural_gas_price_per_m3)
                elif building.project:
                    if building.project.cost_per_kwh_electricity:
                        electricity_cost_per_kwh = float(building.project.cost_per_kwh_electricity)
                    if building.project.natural_gas_price_per_m3:
                        fuel_cost_per_kwh = float(building.project.natural_gas_price_per_m3)
                
                for consumption in energy_consumptions:
                    kwh_equivalent = float(consumption.kwh_equivalent or 0)
                    
                    if consumption.energy_source == 'electricity':
                        cost_per_kwh = electricity_cost_per_kwh
                    else:
                        cost_per_kwh = fuel_cost_per_kwh
                    
                    total_annual_cost += kwh_equivalent * cost_per_kwh
            
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
            
            energy_consumptions = EnergyConsumption.objects.filter(building=building)
            if energy_consumptions.exists():
                total_annual_cost = 0
                project = building.project
                electricity_cost_per_kwh = 0.15
                fuel_cost_per_kwh = 0.10
                
                if project:
                    if project.cost_per_kwh_electricity:
                        electricity_cost_per_kwh = float(project.cost_per_kwh_electricity)
                    if project.natural_gas_price_per_m3:
                        fuel_cost_per_kwh = float(project.natural_gas_price_per_m3)
                
                for consumption in energy_consumptions:
                    kwh_equivalent = float(consumption.kwh_equivalent or 0)
                    
                    if consumption.energy_source == 'electricity':
                        cost_per_kwh = electricity_cost_per_kwh
                    else:
                        cost_per_kwh = fuel_cost_per_kwh
                    
                    total_annual_cost += kwh_equivalent * cost_per_kwh
                
                for item in data:
                    item['current_energy_cost_per_year'] = round(total_annual_cost, 2)
                    if not item.get('natural_gas_cost_per_year'):
                        network_obj = networks.filter(uuid=item['uuid']).first()
                        if network_obj:
                            network_obj._calculate_natural_gas_cost()
                            item['natural_gas_cost_per_year'] = network_obj.natural_gas_cost_per_year
            
            return Response({
                'success': True,
                'data': data,
                'count': networks.count()
            }, status=status.HTTP_200_OK)
        else:
            total_annual_cost = 0
            energy_consumptions = EnergyConsumption.objects.filter(building=building)
            if energy_consumptions.exists():
                project = building.project
                electricity_cost_per_kwh = 0.15
                fuel_cost_per_kwh = 0.10 
                
                if project:
                    if project.cost_per_kwh_electricity:
                        electricity_cost_per_kwh = float(project.cost_per_kwh_electricity)
                    if project.natural_gas_price_per_m3:
                        fuel_cost_per_kwh = float(project.natural_gas_price_per_m3)
                
                for consumption in energy_consumptions:
                    kwh_equivalent = float(consumption.kwh_equivalent or 0)
                    
                    if consumption.energy_source == 'electricity':
                        cost_per_kwh = electricity_cost_per_kwh
                    else:
                        cost_per_kwh = fuel_cost_per_kwh
                    
                    total_annual_cost += kwh_equivalent * cost_per_kwh
            
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
