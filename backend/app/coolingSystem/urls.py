from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_cooling_system, name='create_cooling_system'),
    path('building/<str:building_uuid>/', views.get_building_cooling_systems, name='get_building_cooling_systems'),
    path('update/<str:system_uuid>/', views.update_cooling_system, name='update_cooling_system'),
    path('delete/<str:system_uuid>/', views.delete_cooling_system, name='delete_cooling_system'),
]
