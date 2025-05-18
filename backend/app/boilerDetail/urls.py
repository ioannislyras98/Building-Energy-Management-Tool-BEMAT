from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_boiler_detail, name='create_boiler_detail'),
    path('building/<str:building_uuid>/', views.get_building_boiler_details, name='get_building_boiler_details'),
    path('update/<str:boiler_uuid>/', views.update_boiler_detail, name='update_boiler_detail'),
    path('delete/<str:boiler_uuid>/', views.delete_boiler_detail, name='delete_boiler_detail'),
]
