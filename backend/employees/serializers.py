from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, JobRole, Department

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class JobRoleSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = JobRole
        fields = ['id', 'name', 'description', 'department', 'created_at', 'updated_at']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    # User fields for creation (following authentication profile pattern)
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'email', 'username', 'password', 'confirm_password',
            'first_name', 'last_name', 'address', 'manager', 
            'profile_image', 'role', 'expected_hours'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = {
            'email': validated_data.pop('email'),
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'first_name': validated_data.get('first_name'),
            'last_name': validated_data.get('last_name'),
        }
        
        # Remove confirm_password
        validated_data.pop('confirm_password', None)
        
        # Create user first (following authentication profile pattern)
        user = User.objects.create_user(**user_data)
        
        # Create employee profile
        employee = Employee.objects.create(user=user, **validated_data)
        return employee


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'address', 'manager', 
            'profile_image', 'role', 'is_active', 'expected_hours'
        ]


class EmployeeProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()
    phone_number = serializers.ReadOnlyField()
    role = JobRoleSerializer(read_only=True)
    manager = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'first_name', 'last_name', 'email', 'address', 
            'phone_number', 'manager', 'date_joined', 'profile_image', 
            'role', 'department', 'is_active', 'expected_hours', 'created_at', 'updated_at', 'full_name'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
    
    def get_manager(self, obj):
        if obj.manager:
            return {
                'id': obj.manager.id,
                'name': obj.manager.full_name,
                'email': obj.manager.email
            }
        return None
    
    def get_department(self, obj):
        return {
            'id': obj.department.id,
            'name': obj.department.name,
            'description': obj.department.description
        }


class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()
    role = JobRoleSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'first_name', 'last_name', 'email', 'role', 
            'date_joined', 'is_active', 'full_name'
        ]
