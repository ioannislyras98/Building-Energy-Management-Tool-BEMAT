from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import admin_views

urlpatterns = [
    path("api/admin/", admin.site.urls),
    path('api/users/', include('user.urls')),
    path('api/buildings/', include('building.urls')),
    path('api/projects/', include('project.urls')),
    path('api/energy_consumptions/', include('energyConsumption.urls')),
    path('api/contacts/', include('contact.urls')),
    path('api/boiler_details/', include('boilerDetail.urls')),
    path('api/cooling_systems/', include('coolingSystem.urls')),
    path('api/heating_systems/', include('heatingSystem.urls')),
    path('api/domestic_hot_water_systems/', include('domesticHotWaterSystem.urls')),
    path('api/solar_collectors/', include('solarCollectors.urls')),
    path('api/thermal_zones/', include('thermalZone.urls')),
    path('api/electrical_consumptions/', include('electricalConsumption.urls')),
    path('api/materials/', include('materials.urls')),
    path('api/prefectures/', include('prefectures.urls')),
    path('api/numeric_values/', include('numericValues.urls')),
    path('api/thermal_insulations/', include('thermalInsulation.urls')),
    path('api/roof_thermal_insulations/', include('roofThermalInsulation.urls')),
    path('api/photovoltaic_systems/', include('photovoltaicSystem.urls')),
    path('api/window_replacements/', include('windowReplacement.urls')),
    path('api/bulb_replacements/', include('bulbReplacement.urls')),
    path('api/air_conditioning_replacements/', include('airConditioningReplacement.urls')),
    path('api/hot_water_upgrades/', include('hotWaterUpgrade.urls')),
    path('api/natural_gas_networks/', include('naturalGasNetwork.urls')),
    path('api/exterior_blinds/', include('exteriorBlinds.urls')),
    path('api/automatic_lighting_control/', include('automaticLightingControl.urls')),
    path('api/boiler_replacement/', include('boilerReplacement.urls')),
    path('api/', include('buildingImages.urls')),
    
    # Admin endpoints
    path('api/admin-api/dashboard-stats/', admin_views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('api/admin-api/users/', admin_views.admin_users_list, name='admin_users_list'),
    path('api/admin-api/users/<uuid:user_uuid>/', admin_views.admin_user_detail, name='admin_user_detail'),
    
    # Admin table management endpoints
    path('api/admin-api/users-table/', admin_views.admin_users_table, name='admin_users_table'),
    path('api/admin-api/projects-table/', admin_views.admin_projects_table, name='admin_projects_table'),
    path('api/admin-api/users/bulk-delete/', admin_views.admin_bulk_delete_users, name='admin_bulk_delete_users'),
    path('api/admin-api/projects/bulk-delete/', admin_views.admin_bulk_delete_projects, name='admin_bulk_delete_projects'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
