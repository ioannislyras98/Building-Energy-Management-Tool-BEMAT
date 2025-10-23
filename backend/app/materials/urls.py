from django.urls import path
from . import views

urlpatterns = [
    path('', views.MaterialListCreateView.as_view(), name='materials'),
    path('<uuid:uuid>/', views.MaterialDetailView.as_view(), name='material-detail'),
    path('category/<str:category>/', views.get_materials_by_category, name='materials-by-category'),
    path('active/all/', views.get_all_active_materials, name='all-active-materials'),
    path('categories/list/', views.get_material_categories, name='material-categories'),
    path('admin/all/', views.get_all_materials_admin, name='admin-all-materials'),
]
