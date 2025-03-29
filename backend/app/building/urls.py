from django.urls import path
from .views import create_building, get_buildings, delete_building

urlpatterns = [
    path('create/', create_building, name='create_building'),
    path('get/', get_buildings, name='get_buildings'),
    path('delete/<uuid:building_uuid>/', delete_building, name='delete_building'),
]