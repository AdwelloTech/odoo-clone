from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # Basic CRUD endpoints
    path('', views.AttendanceListView.as_view(), name='attendance-list'),
    path('create/', views.AttendanceCreateView.as_view(), name='attendance-create'),
    path('<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance-detail'),
    
    # Check-in/Check-out endpoints
    path('<int:attendance_id>/check-in/', views.check_in, name='attendance-check-in'),
    path('<int:attendance_id>/check-out/', views.check_out, name='attendance-check-out'),
    
    # Query endpoints
    path('employee/<int:employee_id>/', views.attendance_by_employee, name='attendance-by-employee'),
    path('date-range/', views.attendance_by_date_range, name='attendance-by-date-range'),
    path('today/', views.today_attendance, name='today-attendance'),
]
