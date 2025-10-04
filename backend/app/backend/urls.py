from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import admin_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('users/', include('user.urls')),
    path('buildings/', include('building.urls')),
    path('projects/', include('project.urls')),
    path('energy_consumptions/', include('energyConsumption.urls')),
    path('contacts/', include('contact.urls')),
    path('boiler_details/', include('boilerDetail.urls')),
    path('cooling_systems/', include('coolingSystem.urls')),
    path('heating_systems/', include('heatingSystem.urls')),
    path('domestic_hot_water_systems/', include('domesticHotWaterSystem.urls')),
    path('solar_collectors/', include('solarCollectors.urls')),
    path('thermal_zones/', include('thermalZone.urls')),
    path('electrical_consumptions/', include('electricalConsumption.urls')),
    path('materials/', include('materials.urls')),
    path('prefectures/', include('prefectures.urls')),
    path('thermal_insulations/', include('thermalInsulation.urls')),
    path('roof_thermal_insulations/', include('roofThermalInsulation.urls')),
    path('photovoltaic_systems/', include('photovoltaicSystem.urls')),
    path('window_replacements/', include('windowReplacement.urls')),
    path('bulb_replacements/', include('bulbReplacement.urls')),
    path('air_conditioning_replacements/', include('airConditioningReplacement.urls')),
    path('hot_water_upgrades/', include('hotWaterUpgrade.urls')),
    path('natural_gas_networks/', include('naturalGasNetwork.urls')),
    path('exterior_blinds/', include('exteriorBlinds.urls')),
    path('automatic_lighting_control/', include('automaticLightingControl.urls')),
    path('boiler_replacement/', include('boilerReplacement.urls')),
    path('', include('buildingImages.urls')),
    
    # Admin endpoints
    path('admin-api/dashboard-stats/', admin_views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin-api/users/', admin_views.admin_users_list, name='admin_users_list'),
    path('admin-api/users/<uuid:user_uuid>/', admin_views.admin_user_detail, name='admin_user_detail'),
    
    # Admin table management endpoints
    path('admin-api/users-table/', admin_views.admin_users_table, name='admin_users_table'),
    path('admin-api/projects-table/', admin_views.admin_projects_table, name='admin_projects_table'),
    path('admin-api/users/bulk-delete/', admin_views.admin_bulk_delete_users, name='admin_bulk_delete_users'),
    path('admin-api/projects/bulk-delete/', admin_views.admin_bulk_delete_projects, name='admin_bulk_delete_projects'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
