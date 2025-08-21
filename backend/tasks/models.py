from django.db import models
from django.utils import timezone


class Task(models.Model):
    """Model to represent individual tasks that employees work on"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    task_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Date fields
    task_date = models.DateField()  # The date this task is for
    estimated_duration_minutes = models.PositiveIntegerField(null=True, blank=True, help_text="Estimated duration in minutes")
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)  # When task was created in system
    updated_at = models.DateTimeField(auto_now=True)
    created_by_date = models.DateField(auto_now_add=True)  # Date when task was recorded (for tracking retroactive entries)
    
    class Meta:
        ordering = ['-task_date', '-created_at']
        indexes = [
            models.Index(fields=['employee', 'task_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.employee.full_name} ({self.task_date})"
    
    @property
    def total_time_spent_seconds(self):
        """Calculate total time spent on this task in seconds"""
        total_seconds = 0
        for session in self.sessions.filter(end_time__isnull=False):
            duration = (session.end_time - session.start_time).total_seconds()
            total_seconds += duration
        return int(total_seconds)
    
    @property
    def total_time_spent_minutes(self):
        """Calculate total time spent on this task in minutes"""
        return int(self.total_time_spent_seconds // 60)
    
    @property
    def is_active(self):
        """Check if task has an active session"""
        return self.sessions.filter(end_time__isnull=True).exists()
    
    @property
    def current_session(self):
        """Get current active session if any"""
        return self.sessions.filter(end_time__isnull=True).first()
    
    @property
    def current_session_duration_seconds(self):
        """Get current session duration in seconds"""
        current_session = self.current_session
        if not current_session:
            return 0
        duration = (timezone.now() - current_session.start_time).total_seconds()
        return int(duration)


class TaskSession(models.Model):
    """Model to track time sessions for tasks"""
    session_id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='sessions')
    attendance = models.ForeignKey('attendance.Attendance', on_delete=models.CASCADE, related_name='task_sessions', null=True, blank=True)
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True, help_text="Notes about what was accomplished in this session")
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['task', 'start_time']),
        ]
    
    def __str__(self):
        duration = ""
        if self.end_time:
            duration_seconds = (self.end_time - self.start_time).total_seconds()
            duration = f" ({int(duration_seconds // 60)}min)"
        return f"{self.task.title} - {self.start_time.strftime('%H:%M')}{duration}"
    
    @property
    def duration_seconds(self):
        """Get session duration in seconds"""
        if not self.end_time:
            # Active session - calculate current duration
            return int((timezone.now() - self.start_time).total_seconds())
        return int((self.end_time - self.start_time).total_seconds())
    
    @property
    def duration_minutes(self):
        """Get session duration in minutes"""
        return int(self.duration_seconds // 60)
    
    @property
    def is_active(self):
        """Check if session is currently active"""
        return self.end_time is None