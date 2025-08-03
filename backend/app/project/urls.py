from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_project, name='create_project'),
    path('get/', views.get_projects, name='get_projects'),
    path('get/<uuid:uuid>/', views.get_project_detail, name='get_project_detail'),
    path('delete/<uuid:uuid>/', views.delete_project, name='delete_project'),
    path('update/<uuid:uuid>/', views.update_project, name='update_project'),
    path('submit/<uuid:uuid>/', views.submit_project, name='submit_project'),
    path('pending-percentage/', views.get_pending_projects_percentage, name='get_pending_projects_percentage'),
    path('building-progress/<uuid:building_uuid>/', views.get_building_progress, name='get_building_progress'),
]