from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_thermal_zone, name='create_thermal_zone'),
    path('building/<str:building_uuid>/', views.get_building_thermal_zones, name='get_building_thermal_zones'),
    path('update/<str:zone_uuid>/', views.update_thermal_zone, name='update_thermal_zone'),
    path('delete/<str:zone_uuid>/', views.delete_thermal_zone, name='delete_thermal_zone'),
]
