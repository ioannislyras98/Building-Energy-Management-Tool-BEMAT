from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_electrical_consumption, name='create_electrical_consumption'),
    path('building/<str:building_uuid>/', views.get_building_electrical_consumptions, name='get_building_electrical_consumptions'),
    path('update/<str:consumption_uuid>/', views.update_electrical_consumption, name='update_electrical_consumption'),
    path('delete/<str:consumption_uuid>/', views.delete_electrical_consumption, name='delete_electrical_consumption'),
]
