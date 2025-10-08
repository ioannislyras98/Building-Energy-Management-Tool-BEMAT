from django.urls import path
from .views import NumericValueListView, NumericValueUpdateView

urlpatterns = [
    path('', NumericValueListView.as_view(), name='numeric-values-list'),
    path('<uuid:uuid>/', NumericValueUpdateView.as_view(), name='numeric-value-update'),
]
