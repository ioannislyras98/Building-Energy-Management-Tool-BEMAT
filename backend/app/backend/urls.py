from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('users/', include('user.urls')),
    path('buildings/', include('building.urls')),
    path('projects/', include('project.urls')),
    path('energy_consumptions/', include('energyConsumption.urls')),
    path('contacts/', include('contact.urls')),
    path('boiler_details/', include('boilerDetail.urls'))
]
