from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_natural_gas_network, name='create_natural_gas_network'),
    
    path('building/<uuid:building_uuid>/', views.get_natural_gas_networks_by_building, name='get_natural_gas_networks_by_building'),
    
    path('all/', views.get_all_natural_gas_networks, name='get_all_natural_gas_networks'),
    
    path('<uuid:network_uuid>/', views.get_natural_gas_network_detail, name='get_natural_gas_network_detail'),
    path('<uuid:network_uuid>/update/', views.update_natural_gas_network, name='update_natural_gas_network'),
    path('<uuid:network_uuid>/delete/', views.delete_natural_gas_network, name='delete_natural_gas_network'),
]
