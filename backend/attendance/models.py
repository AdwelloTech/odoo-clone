from django.db import models
from django.conf import settings


class Attendance(models.Model):
    attendance_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=100)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    
    # System fields (following authentication profile pattern)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        # Removed unique constraint to allow multiple sessions per day
        # unique_together = ['employee', 'date']  # One attendance record per employee per day

    def __str__(self):
        try:
            if self.employee:
                return f"{self.employee.full_name} - {self.date} - {self.status}"
            return f"Unknown Employee - {self.date} - {self.status}"
        except Exception:
            return f"Unknown Employee - {self.date} - {self.status}"
    
    @property
    def employee_name(self):
        try:
            if self.employee:
                return self.employee.full_name
            return 'Unknown Employee'
        except Exception:
            return 'Unknown Employee'
    
    @property
    def employee_email(self):
        try:
            if self.employee:
                return self.employee.email
            return 'No Email'
        except Exception:
            return 'No Email'
    
    @property
    def department(self):
        try:
            if self.employee and self.employee.role and self.employee.role.department:
                return self.employee.role.department.name
            return 'N/A'
        except Exception:
            return 'N/A'
