from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_building, name='create_building'),
    path('get/', views.get_buildings, name='get_buildings'),
    path('get/<uuid:uuid>/', views.get_building_detail, name='get_building_detail'),
    path('delete/<uuid:uuid>/', views.delete_building, name='delete_building'),
    path('update/<uuid:uuid>/', views.update_building, name='update_building'),
]