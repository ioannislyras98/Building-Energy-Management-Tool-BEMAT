from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_natural_gas_network, name='create_natural_gas_network'),
    
    path('building/<uuid:building_uuid>/', views.get_natural_gas_networks_by_building, name='get_natural_gas_networks_by_building'),
    
    path('all/', views.get_all_natural_gas_networks, name='get_all_natural_gas_networks'),
    
    path('<int:network_id>/', views.get_natural_gas_network_detail, name='get_natural_gas_network_detail'),
    path('<int:network_id>/update/', views.update_natural_gas_network, name='update_natural_gas_network'),
    path('<int:network_id>/delete/', views.delete_natural_gas_network, name='delete_natural_gas_network'),
]
