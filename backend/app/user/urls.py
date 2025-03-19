from django.urls import path
from .views import SignUpView, ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', obtain_auth_token, name='login'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('reset-password-confirm/<uid>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
