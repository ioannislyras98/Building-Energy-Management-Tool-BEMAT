from django.urls import path
from . import views

urlpatterns = [
    path('building/<uuid:building_id>/', views.get_boiler_replacement_by_building, name='get_boiler_replacement_by_building'),
    path('create/', views.boiler_replacement_create, name='boiler_replacement_create'),
]
