from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuildingActivityViewSet

router = DefaultRouter()
router.register('building-activities', BuildingActivityViewSet, basename='buildingactivity')

urlpatterns = [
    path('', include(router.urls)),
]
