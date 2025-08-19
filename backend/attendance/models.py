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
        unique_together = ['employee', 'date']  # One attendance record per employee per day

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} - {self.status}"
    
    @property
    def employee_name(self):
        return self.employee.full_name
    
    @property
    def employee_email(self):
        return self.employee.email
    
    @property
    def department(self):
        return self.employee.department.name if self.employee.department else 'N/A'
