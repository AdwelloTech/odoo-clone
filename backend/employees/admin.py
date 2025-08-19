from django.contrib import admin
from .models import Employee, JobRole, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']


@admin.register(JobRole)
class JobRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'description', 'created_at', 'updated_at']
    list_filter = ['department']
    search_fields = ['name', 'description', 'department__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['department__name', 'name']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'user_email', 'role', 'department', 'date_joined', 
        'is_active', 'manager_name'
    ]
    list_filter = [
        'role__department', 'role', 'is_active', 'date_joined'
    ]
    search_fields = [
        'first_name', 'last_name', 'user__email', 'role__name', 'role__department__name'
    ]
    readonly_fields = ['date_joined', 'created_at', 'updated_at', 'full_name', 'user_email', 'user_phone', 'department_info']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'user_email', 'user_phone')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name')
        }),
        ('Work Information', {
            'fields': ('role', 'manager', 'date_joined')
        }),
        ('Additional Information', {
            'fields': ('address', 'profile_image', 'is_active')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else ''
    user_email.short_description = 'Email'
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else ''
    user_phone.short_description = 'Phone Number'
    
    def manager_name(self, obj):
        return obj.manager.full_name if obj.manager else 'No Manager'
    manager_name.short_description = 'Manager'
    
    def department(self, obj):
        return obj.role.department.name if obj.role and obj.role.department else 'N/A'
    department.short_description = 'Department'
    
    def department_info(self, obj):
        if obj.role and obj.role.department:
            return f"{obj.role.department.name} - {obj.role.department.description or 'No description'}"
        return 'N/A'
    department_info.short_description = 'Department Information'
