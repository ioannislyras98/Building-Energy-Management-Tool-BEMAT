from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_solar_collector, name='create_solar_collector'),
    path('building/<str:building_uuid>/', views.get_building_solar_collectors, name='get_building_solar_collectors'),
    path('update/<str:system_uuid>/', views.update_solar_collector, name='update_solar_collector'),
    path('delete/<str:system_uuid>/', views.delete_solar_collector, name='delete_solar_collector'),
]
