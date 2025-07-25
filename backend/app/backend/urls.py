from django.contrib import admin
from django.urls import path, include

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
]
