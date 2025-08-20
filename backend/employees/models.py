from django.db import models
from django.conf import settings


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class JobRole(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='job_roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department__name', 'name']

    def __str__(self):
        return f"{self.name} - {self.department.name}"


class Employee(models.Model):
    # OneToOneField relationship with User (following authentication profile pattern)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    
    # Required fields
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    
    # Optional fields
    address = models.TextField(blank=True, null=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    date_joined = models.DateField(auto_now_add=True)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )
    role = models.ForeignKey(JobRole, on_delete=models.CASCADE)
    expected_hours = models.IntegerField(default=8, help_text="Expected working hours per day")
    
    # System fields (following authentication profile pattern)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.role.name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def email(self):
        return self.user.email
    
    @property
    def phone_number(self):
        return self.user.phone_number
    
    @property
    def department(self):
        return self.role.department

