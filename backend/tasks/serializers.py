from rest_framework import serializers
from .models import Task, TaskSession


class TaskSessionSerializer(serializers.ModelSerializer):
    duration_seconds = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = TaskSession
        fields = [
            'session_id', 'task', 'attendance', 'start_time', 'end_time',
            'notes', 'duration_seconds', 'duration_minutes', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['session_id', 'created_at', 'updated_at']


class TaskSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSession
        fields = ['task', 'attendance', 'notes']


class TaskListSerializer(serializers.ModelSerializer):
    total_time_spent_seconds = serializers.ReadOnlyField()
    total_time_spent_minutes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    current_session_duration_seconds = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'task_id', 'title', 'description', 'priority', 'status',
            'task_date', 'estimated_duration_minutes', 'total_time_spent_seconds',
            'total_time_spent_minutes', 'is_active', 'current_session_duration_seconds',
            'created_at', 'updated_at'
        ]


class TaskDetailSerializer(serializers.ModelSerializer):
    total_time_spent_seconds = serializers.ReadOnlyField()
    total_time_spent_minutes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    current_session = TaskSessionSerializer(read_only=True)
    current_session_duration_seconds = serializers.ReadOnlyField()
    sessions = TaskSessionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'task_id', 'employee', 'title', 'description', 'priority', 'status',
            'task_date', 'estimated_duration_minutes', 'total_time_spent_seconds',
            'total_time_spent_minutes', 'is_active', 'current_session',
            'current_session_duration_seconds', 'sessions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['task_id', 'created_at', 'updated_at']


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'priority', 'status', 'task_date',
            'estimated_duration_minutes'
        ]
    
    def create(self, validated_data):
        # Add the employee from the request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from employees.models import Employee
            try:
                employee = Employee.objects.get(user=request.user)
                validated_data['employee'] = employee
            except Employee.DoesNotExist:
                raise serializers.ValidationError("Employee profile not found for user")
        return super().create(validated_data)


class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'priority', 'status',
            'estimated_duration_minutes'
        ]