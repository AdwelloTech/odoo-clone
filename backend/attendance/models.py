from django.db import models
from django.conf import settings
from django.utils import timezone


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
    
    @property
    def is_on_break(self):
        """Check if employee is currently on break"""
        return self.breaks.filter(break_end_time__isnull=True).exists()
    
    @property
    def current_break(self):
        """Get the current active break if any"""
        return self.breaks.filter(break_end_time__isnull=True).first()
    
    @property
    def total_break_minutes(self):
        """Calculate total break time in minutes for this attendance session"""
        total_minutes = 0
        for break_instance in self.breaks.filter(break_end_time__isnull=False):
            duration_seconds = (break_instance.break_end_time - break_instance.break_start_time).total_seconds()
            total_minutes += int(duration_seconds // 60)
        return total_minutes
    
    @property
    def actual_work_minutes(self):
        """Calculate actual working time in minutes (excluding breaks)"""
        if not self.check_in_time:
            return 0
        
        # Calculate total time
        end_time = self.check_out_time or timezone.now()
        total_seconds = (end_time - self.check_in_time).total_seconds()
        total_minutes = int(total_seconds // 60)
        
        # Subtract break time
        return max(0, total_minutes - self.total_break_minutes)
    
    @property
    def actual_work_seconds(self):
        """Calculate actual working time in seconds (excluding breaks)"""
        if not self.check_in_time:
            return 0
        
        # Calculate total time
        end_time = self.check_out_time or timezone.now()
        total_seconds = int((end_time - self.check_in_time).total_seconds())
        
        # Calculate total break seconds
        total_break_seconds = 0
        for break_instance in self.breaks.filter(break_end_time__isnull=False):
            duration_seconds = (break_instance.break_end_time - break_instance.break_start_time).total_seconds()
            total_break_seconds += int(duration_seconds)
        
        # Subtract break time
        return max(0, total_seconds - total_break_seconds)
    
    @property
    def total_break_seconds(self):
        """Calculate total break time in seconds for this attendance session"""
        total_seconds = 0
        for break_instance in self.breaks.filter(break_end_time__isnull=False):
            duration_seconds = (break_instance.break_end_time - break_instance.break_start_time).total_seconds()
            total_seconds += int(duration_seconds)
        return total_seconds
    
    @property
    def current_break_minutes(self):
        """Calculate current break duration in minutes if on break"""
        if not self.is_on_break:
            return 0
        
        current_break = self.current_break
        if not current_break:
            return 0
            
        from django.utils import timezone
        duration_seconds = (timezone.now() - current_break.break_start_time).total_seconds()
        return int(duration_seconds // 60)
    
    @property
    def current_break_seconds(self):
        """Calculate current break duration in seconds if on break"""
        if not self.is_on_break:
            return 0
        
        current_break = self.current_break
        if not current_break:
            return 0
            
        from django.utils import timezone
        duration_seconds = (timezone.now() - current_break.break_start_time).total_seconds()
        return int(duration_seconds)


class Break(models.Model):
    """Model to track breaks during an attendance session"""
    break_id = models.AutoField(primary_key=True)
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='breaks')
    break_start_time = models.DateTimeField()
    break_end_time = models.DateTimeField(null=True, blank=True)
    break_type = models.CharField(max_length=50, default='Regular')  # Regular, Lunch, etc.
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-break_start_time']

    def __str__(self):
        try:
            duration = ""
            if self.break_end_time:
                duration_seconds = (self.break_end_time - self.break_start_time).total_seconds()
                duration = f" ({int(duration_seconds // 60)}min)"
            return f"Break for {self.attendance.employee_name} - {self.break_start_time.strftime('%H:%M')}{duration}"
        except Exception:
            return f"Break {self.break_id}"
    
    @property
    def duration_minutes(self):
        """Get break duration in minutes"""
        if not self.break_end_time:
            return None
        duration_seconds = (self.break_end_time - self.break_start_time).total_seconds()
        return int(duration_seconds // 60)
    
    @property
    def is_active(self):
        """Check if break is currently active (not ended)"""
        return self.break_end_time is None