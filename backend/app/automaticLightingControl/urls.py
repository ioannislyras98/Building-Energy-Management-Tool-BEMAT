from django.urls import path
from . import views

urlpatterns = [
    path('building/<uuid:building_id>/', views.get_automatic_lighting_control_by_building, name='get_automatic_lighting_control_by_building'),
    path('create/', views.automatic_lighting_control_create, name='automatic_lighting_control_create'),
]
