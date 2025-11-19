from django.urls import path
from .views import (
    BulbReplacementListView,
    BulbReplacementByBuildingView,
    BulbReplacementCreateView,
    BulbReplacementDetailView,
    BulbReplacementUpdateView,
    BulbReplacementDeleteView,
    get_bulb_replacement_summary
)

urlpatterns = [
    path('', BulbReplacementListView.as_view(), name='bulb-replacement-list'),
    path('building/<uuid:building_uuid>/', BulbReplacementByBuildingView.as_view(), name='bulb-replacement-by-building'),
    path('create/', BulbReplacementCreateView.as_view(), name='bulb-replacement-create'),
    path('update/<uuid:uuid>/', BulbReplacementUpdateView.as_view(), name='bulb-replacement-update'),
    path('<uuid:uuid>/', BulbReplacementDetailView.as_view(), name='bulb-replacement-detail'),
    path('<uuid:uuid>/delete/', BulbReplacementDeleteView.as_view(), name='bulb-replacement-delete'),
    path('building/<uuid:building_uuid>/summary/', get_bulb_replacement_summary, name='bulb-replacement-summary'),
]
