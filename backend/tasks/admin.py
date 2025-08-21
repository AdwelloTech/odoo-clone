from django.contrib import admin
from .models import Task, TaskSession


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'task_id', 'title', 'employee_name', 'task_date', 'priority', 'status',
        'total_time_spent_minutes', 'is_active', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'task_date', 'created_by_date'
    ]
    search_fields = [
        'title', 'description', 'employee__first_name', 'employee__last_name'
    ]
    readonly_fields = [
        'task_id', 'total_time_spent_seconds', 'total_time_spent_minutes',
        'is_active', 'current_session', 'created_at', 'updated_at'
    ]
    ordering = ['-task_date', '-created_at']
    
    fieldsets = (
        ('Task Information', {
            'fields': ('task_id', 'employee', 'title', 'description')
        }),
        ('Task Details', {
            'fields': ('task_date', 'priority', 'status', 'estimated_duration_minutes')
        }),
        ('Time Tracking', {
            'fields': ('total_time_spent_minutes', 'is_active', 'current_session'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        return obj.employee.full_name
    employee_name.short_description = 'Employee'


@admin.register(TaskSession)
class TaskSessionAdmin(admin.ModelAdmin):
    list_display = [
        'session_id', 'task_title', 'employee_name', 'start_time', 'end_time',
        'duration_minutes', 'is_active'
    ]
    list_filter = [
        'start_time', 'task__status', 'task__priority'
    ]
    search_fields = [
        'task__title', 'task__employee__first_name', 'task__employee__last_name', 'notes'
    ]
    readonly_fields = [
        'session_id', 'duration_seconds', 'duration_minutes', 'is_active',
        'created_at', 'updated_at'
    ]
    ordering = ['-start_time']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session_id', 'task', 'attendance')
        }),
        ('Timing', {
            'fields': ('start_time', 'end_time', 'duration_minutes', 'is_active')
        }),
        ('Details', {
            'fields': ('notes',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def task_title(self, obj):
        return obj.task.title
    task_title.short_description = 'Task'
    
    def employee_name(self, obj):
        return obj.task.employee.full_name
    employee_name.short_description = 'Employee'
