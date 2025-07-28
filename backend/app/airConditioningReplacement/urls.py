from django.urls import path
from . import views

urlpatterns = [
    # Old Air Conditioning URLs
    path('old/create/', views.create_old_air_conditioning, name='create_old_air_conditioning'),
    path('old/building/<uuid:building_uuid>/', views.get_old_air_conditionings_by_building, name='get_old_air_conditionings_by_building'),
    path('old/update/<uuid:ac_uuid>/', views.update_old_air_conditioning, name='update_old_air_conditioning'),
    path('old/delete/<uuid:ac_uuid>/', views.delete_old_air_conditioning, name='delete_old_air_conditioning'),
    
    # New Air Conditioning URLs
    path('new/create/', views.create_new_air_conditioning, name='create_new_air_conditioning'),
    path('new/building/<uuid:building_uuid>/', views.get_new_air_conditionings_by_building, name='get_new_air_conditionings_by_building'),
    path('new/update/<uuid:ac_uuid>/', views.update_new_air_conditioning, name='update_new_air_conditioning'),
    path('new/delete/<uuid:ac_uuid>/', views.delete_new_air_conditioning, name='delete_new_air_conditioning'),
    
    # Analysis URLs
    path('analysis/create/', views.create_air_conditioning_analysis, name='create_air_conditioning_analysis'),
    path('analysis/building/<uuid:building_uuid>/', views.get_air_conditioning_analysis_by_building, name='get_air_conditioning_analysis_by_building'),
    path('analysis/update/<uuid:analysis_uuid>/', views.update_air_conditioning_analysis, name='update_air_conditioning_analysis'),
]
