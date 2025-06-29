from django.urls import path
from . import views

urlpatterns = [
    # Roof Thermal Insulation URLs
    path('', views.RoofThermalInsulationListView.as_view(), 
         name='roof-thermal-insulations'),
    path('create/', views.RoofThermalInsulationCreateView.as_view(), 
         name='roof-thermal-insulation-create'),
    path('<uuid:uuid>/', views.RoofThermalInsulationDetailView.as_view(), 
         name='roof-thermal-insulation-detail'),
    path('building/<uuid:building_uuid>/', views.get_roof_thermal_insulations_by_building, 
         name='roof-thermal-insulations-by-building'),
    path('project/<uuid:project_uuid>/', views.get_roof_thermal_insulations_by_project, 
         name='roof-thermal-insulations-by-project'),
    path('<uuid:thermal_insulation_uuid>/recalculate/', views.recalculate_u_coefficient, 
         name='roof-recalculate-u-coefficient'),
    
    # Material Layer URLs
    path('material-layers/create/', views.RoofThermalInsulationMaterialLayerCreateView.as_view(), 
         name='roof-material-layer-create'),
    path('material-layers/<uuid:uuid>/', views.RoofThermalInsulationMaterialLayerDetailView.as_view(), 
         name='roof-material-layer-detail'),
]
