from django.urls import path
from .views import (
    PhotovoltaicSystemListCreateView,
    PhotovoltaicSystemDetailView,
    photovoltaic_system_summary,
    calculate_photovoltaic_costs,
    photovoltaic_systems_by_building,
    photovoltaic_systems_by_project,
)

urlpatterns = [
    # CRUD operations
    path('', PhotovoltaicSystemListCreateView.as_view(), name='photovoltaic-system-list-create'),
    path('<uuid:uuid>/', PhotovoltaicSystemDetailView.as_view(), name='photovoltaic-system-detail'),
    
    # Statistics and calculations
    path('summary/', photovoltaic_system_summary, name='photovoltaic-system-summary'),
    path('calculate-costs/', calculate_photovoltaic_costs, name='calculate-photovoltaic-costs'),
    
    # Filter by building/project
    path('building/<uuid:building_uuid>/', photovoltaic_systems_by_building, name='photovoltaic-systems-by-building'),
    path('project/<uuid:project_uuid>/', photovoltaic_systems_by_project, name='photovoltaic-systems-by-project'),
]
