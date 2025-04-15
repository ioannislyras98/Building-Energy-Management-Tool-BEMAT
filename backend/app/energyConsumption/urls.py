from django.urls import path
from .views import (
    CreateEnergyConsumption,
    UpdateEnergyConsumption,
    DeleteEnergyConsumption,
    GetEnergyConsumptionByBuilding,
    GetEnergyConsumptionByProject,
    GetEnergyConsumptionByUser,
    GetEnergyConsumptionByUUID,
)

urlpatterns = [
    path('create/', CreateEnergyConsumption.as_view(), name='create_energy_consumption'),
    path('update/<uuid:uuid>/', UpdateEnergyConsumption.as_view(), name='update_energy_consumption'),
    path('delete/<uuid:uuid>/', DeleteEnergyConsumption.as_view(), name='delete_energy_consumption'),
    path('get_by_building/<uuid:building_id>/', GetEnergyConsumptionByBuilding.as_view(), name='get_energy_consumption_by_building'),
    path('get_by_project/<uuid:project_id>/', GetEnergyConsumptionByProject.as_view(), name='get_energy_consumption_by_project'),
    path('get_by_user/<uuid:user_id>/', GetEnergyConsumptionByUser.as_view(), name='get_energy_consumption_by_user'),
    path('get/<uuid:uuid>/', GetEnergyConsumptionByUUID.as_view(), name='get_energy_consumption_by_uuid'),
]