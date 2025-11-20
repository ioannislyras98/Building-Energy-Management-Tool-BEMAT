from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_hot_water_upgrade, name='create_hot_water_upgrade'),
    path('building/<str:building_uuid>/', views.get_hot_water_upgrade_by_building, name='get_hot_water_upgrade_by_building'),
    path('<uuid:uuid>/', views.get_hot_water_upgrade_detail, name='get_hot_water_upgrade_detail'),
    path('<uuid:uuid>/update/', views.update_hot_water_upgrade, name='update_hot_water_upgrade'),
    path('<uuid:uuid>/delete/', views.delete_hot_water_upgrade, name='delete_hot_water_upgrade'),
]
