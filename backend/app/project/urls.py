from django.urls import path
from .views import create_project, delete_project, get_projects

urlpatterns = [
    path('create/', create_project, name='create_project'),
    path('delete/<uuid:project_uuid>/', delete_project, name='delete_project'),
    path('get/', get_projects, name='get_projects'),
]