from django.urls import path
from . import views

app_name = 'employees'

urlpatterns = [
    # Department endpoints
    path('departments/', views.DepartmentListView.as_view(), name='department-list'),
    path('departments/<int:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    
    # Job Role endpoints
    path('job-roles/', views.JobRoleListView.as_view(), name='job-role-list'),
    path('job-roles/<int:pk>/', views.JobRoleDetailView.as_view(), name='job-role-detail'),
    
    # Employee endpoints
    path('employees/', views.EmployeeListView.as_view(), name='employee-list'),
    path('employees/create/', views.EmployeeCreateView.as_view(), name='employee-create'),
    path('employees/<int:pk>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    path('employees/<int:pk>/delete/', views.employee_delete, name='employee-delete'),
    path('employees/active/', views.employee_active, name='employee-active'),
    path('employees/inactive/', views.employee_inactive, name='employee-inactive'),
    path('employees/<int:pk>/reactivate/', views.employee_reactivate, name='employee-reactivate'),
]
