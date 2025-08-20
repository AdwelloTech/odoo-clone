from django.contrib import admin
from .models import Attendance, Break


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'attendance_id', 'employee_name', 'employee_email', 'department', 
        'date', 'status', 'check_in_time', 'check_out_time'
    ]
    list_filter = [
        'status', 'date', 'employee__role__department'
    ]
    search_fields = [
        'employee__first_name', 'employee__last_name', 'employee__user__email',
        'employee__role__name', 'employee__role__department__name'
    ]
    readonly_fields = [
        'attendance_id', 'created_at', 'updated_at', 'employee_name', 
        'employee_email', 'department'
    ]
    ordering = ['-date', '-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('attendance_id', 'employee', 'date', 'status')
        }),
        ('Time Tracking', {
            'fields': ('check_in_time', 'check_out_time')
        }),
        ('Employee Information', {
            'fields': ('employee_name', 'employee_email', 'department'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def employee_name(self, obj):
        return obj.employee.full_name
    employee_name.short_description = 'Employee Name'
    
    def employee_email(self, obj):
        return obj.employee.email
    employee_email.short_description = 'Employee Email'
    
    def department(self, obj):
        return obj.employee.department.name if obj.employee.department else 'N/A'
    department.short_description = 'Department'


@admin.register(Break)
class BreakAdmin(admin.ModelAdmin):
    list_display = [
        'break_id', 'attendance_employee_name', 'attendance_date', 
        'break_start_time', 'break_end_time', 'duration_minutes', 'break_type'
    ]
    list_filter = [
        'break_type', 'break_start_time', 'attendance__date'
    ]
    search_fields = [
        'attendance__employee__first_name', 'attendance__employee__last_name',
        'attendance__employee__user__email'
    ]
    readonly_fields = [
        'break_id', 'duration_minutes', 'is_active', 'created_at', 'updated_at'
    ]
    ordering = ['-break_start_time']
    
    fieldsets = (
        ('Break Information', {
            'fields': ('break_id', 'attendance', 'break_type')
        }),
        ('Timing', {
            'fields': ('break_start_time', 'break_end_time', 'duration_minutes', 'is_active')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def attendance_employee_name(self, obj):
        return obj.attendance.employee_name
    attendance_employee_name.short_description = 'Employee'
    
    def attendance_date(self, obj):
        return obj.attendance.date
    attendance_date.short_description = 'Date'
