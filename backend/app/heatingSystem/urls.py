from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_heating_system, name='create_heating_system'),
    path('building/<str:building_uuid>/', views.get_building_heating_systems, name='get_building_heating_systems'),
    path('update/<str:system_uuid>/', views.update_heating_system, name='update_heating_system'),
    path('delete/<str:system_uuid>/', views.delete_heating_system, name='delete_heating_system'),
]
