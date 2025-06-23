from django.urls import path
from . import views

urlpatterns = [
    # Available materials
    path('materials/available/', views.get_available_materials, 
         name='available-materials'),
    
    # External Wall Thermal Insulation URLs
    path('', views.ExternalWallThermalInsulationListView.as_view(), 
         name='thermal-insulations'),
    path('create/', views.ExternalWallThermalInsulationCreateView.as_view(), 
         name='thermal-insulation-create'),
    path('<uuid:uuid>/', views.ExternalWallThermalInsulationDetailView.as_view(), 
         name='thermal-insulation-detail'),
    path('building/<uuid:building_uuid>/', views.get_thermal_insulations_by_building, 
         name='thermal-insulations-by-building'),
    path('project/<uuid:project_uuid>/', views.get_thermal_insulations_by_project, 
         name='thermal-insulations-by-project'),
    path('<uuid:thermal_insulation_uuid>/recalculate/', views.recalculate_u_coefficient, 
         name='recalculate-u-coefficient'),
    
    # Material Layer URLs
    path('<uuid:thermal_insulation_uuid>/materials/add/', 
         views.ThermalInsulationMaterialLayerCreateView.as_view(), 
         name='thermal-insulation-material-layer-create'),
    path('material-layers/<uuid:uuid>/', 
         views.ThermalInsulationMaterialLayerDetailView.as_view(), 
         name='thermal-insulation-material-layer-detail'),
]
