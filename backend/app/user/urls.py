from django.urls import path, include
from rest_framework import routers
from user.views import UserView

router = routers.DefaultRouter()
router.register(r'user', UserView)

urlpatterns = [
    path('', include(router.urls)),
]