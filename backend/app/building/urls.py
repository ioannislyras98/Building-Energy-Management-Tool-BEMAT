from django.urls import path
from . import views
from contact.views import ContactCreateForBuildingView, ContactListCreateView, ContactDeleteView, ContactUpdateView

urlpatterns = [
    path('create/', views.create_building, name='create_building'),
    path('get/', views.get_buildings, name='get_buildings'),
    path('get/<uuid:uuid>/', views.get_building_detail, name='get_building_detail'),
    path('delete/<uuid:uuid>/', views.delete_building, name='delete_building'),
    path('update/<uuid:uuid>/', views.update_building, name='update_building'),
    path('<uuid:building_uuid>/contacts/create/', ContactCreateForBuildingView.as_view(), name='building-contact-create'),
    path('<uuid:building_uuid>/contacts/', ContactListCreateView.as_view(), name='building-contact-list'),
    path('<uuid:building_uuid>/contacts/<uuid:contact_uuid>/delete/', ContactDeleteView.as_view(), name='building-contact-delete'),
    path('<uuid:building_uuid>/contacts/<uuid:contact_uuid>/update/', ContactUpdateView.as_view(), name='building-contact-update'),
]