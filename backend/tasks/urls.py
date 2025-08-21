from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    # Task management
    path('', views.my_tasks, name='my-tasks'),
    path('create/', views.create_task, name='create-task'),
    path('<int:task_id>/', views.task_detail, name='task-detail'),
    path('<int:task_id>/update/', views.update_task, name='update-task'),
    path('<int:task_id>/delete/', views.delete_task, name='delete-task'),
    
    # Task sessions
    path('<int:task_id>/start/', views.start_task, name='start-task'),
    path('<int:task_id>/stop/', views.stop_task, name='stop-task'),
    
    # Quick access
    path('today/', views.my_today_tasks, name='today-tasks'),
    path('active/', views.active_task, name='active-task'),
]
