from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # Basic CRUD endpoints
    path('attendance/', views.AttendanceListView.as_view(), name='attendance-list'),
    path('attendance/create/', views.AttendanceCreateView.as_view(), name='attendance-create'),
    path('attendance/<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance-detail'),
    
    # Check-in/Check-out endpoints
    path('attendance/<int:pk>/check-in/', views.check_in, name='attendance-check-in'),
    path('attendance/<int:pk>/check-out/', views.check_out, name='attendance-check-out'),
    
    # Query endpoints
    path('attendance/employee/<int:employee_id>/', views.attendance_by_employee, name='attendance-by-employee'),
    path('attendance/date-range/', views.attendance_by_date_range, name='attendance-by-date-range'),
    path('attendance/today/', views.today_attendance, name='today-attendance'),
]
