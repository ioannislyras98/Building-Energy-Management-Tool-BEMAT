from django.urls import path
from . import views

urlpatterns = [
    # Prefecture URLs
    path('', views.PrefectureListCreateView.as_view(), name='prefectures'),
    path('<uuid:uuid>/', views.PrefectureDetailView.as_view(), name='prefecture-detail'),
    path('zone/<str:zone>/', views.get_prefectures_by_zone, name='prefectures-by-zone'),
    path('active/all/', views.get_all_active_prefectures, name='all-active-prefectures'),
    path('zones/list/', views.get_energy_zones, name='energy-zones'),
    path('admin/all/', views.get_all_prefectures_admin, name='all-prefectures-admin'),
]
