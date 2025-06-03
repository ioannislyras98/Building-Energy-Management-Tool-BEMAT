from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_domestic_hot_water_system, name='create_domestic_hot_water_system'),
    path('building/<str:building_uuid>/', views.get_building_domestic_hot_water_systems, name='get_building_domestic_hot_water_systems'),
    path('update/<str:system_uuid>/', views.update_domestic_hot_water_system, name='update_domestic_hot_water_system'),
    path('delete/<str:system_uuid>/', views.delete_domestic_hot_water_system, name='delete_domestic_hot_water_system'),
]
