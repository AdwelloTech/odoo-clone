from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('signup/', views.UserRegistrationView.as_view(), name='signup'),
    path('signin/', views.user_login, name='signin'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('logout/', views.user_logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh'),
] 