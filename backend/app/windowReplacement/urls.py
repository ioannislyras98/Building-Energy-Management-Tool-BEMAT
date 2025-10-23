from django.urls import path
from . import views

urlpatterns = [
    path('', views.WindowReplacementListView.as_view(), 
         name='window-replacements'),
    path('create/', views.WindowReplacementCreateView.as_view(), 
         name='window-replacement-create'),
    path('<uuid:uuid>/', views.WindowReplacementDetailView.as_view(), 
         name='window-replacement-detail'),
    path('<uuid:uuid>/update/', views.WindowReplacementUpdateView.as_view(), 
         name='window-replacement-update'),
    path('<uuid:uuid>/delete/', views.WindowReplacementDeleteView.as_view(), 
         name='window-replacement-delete'),
    path('building/<uuid:building_uuid>/', views.WindowReplacementByBuildingView.as_view(), 
         name='window-replacements-by-building'),
    path('building/<uuid:building_uuid>/summary/', views.get_window_replacement_summary, 
         name='window-replacement-summary'),
]
