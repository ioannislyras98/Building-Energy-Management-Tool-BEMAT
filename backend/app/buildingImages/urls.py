from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuildingImageViewSet

router = DefaultRouter()
router.register(r'building-images', BuildingImageViewSet, basename='building-images')

urlpatterns = [
    path('', include(router.urls)),
]
