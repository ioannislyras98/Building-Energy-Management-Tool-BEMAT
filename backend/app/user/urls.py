from django.urls import path
from .views import SignUpView, ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView, CustomAuthToken
from . import views
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('reset-password-confirm/<uid>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('me/', views.get_current_user, name='current_user'),
]