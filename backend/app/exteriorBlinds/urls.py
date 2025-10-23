from django.urls import path
from . import views

urlpatterns = [
    path('', views.exterior_blinds_list, name='exterior_blinds_list'),
    path('create/', views.exterior_blinds_create, name='exterior_blinds_create'),
    path('<uuid:uuid>/', views.exterior_blinds_detail, name='exterior_blinds_detail'),
    path('building/<uuid:building_uuid>/', views.get_exterior_blinds_by_building, 
         name='exterior_blinds_by_building'),
    path('project/<uuid:project_uuid>/', views.get_exterior_blinds_by_project, 
         name='exterior_blinds_by_project'),
]
