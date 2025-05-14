from django.urls import path
from .views import ContactListCreateView, ContactDetailView, ContactCreateForBuildingView

urlpatterns = [
    path('create/', ContactListCreateView.as_view(), name='contact-list-create'),
    path('get/<uuid:uuid>/', ContactDetailView.as_view(), name='contact-detail'),
]