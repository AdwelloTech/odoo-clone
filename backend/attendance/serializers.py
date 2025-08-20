from rest_framework import serializers
from .models import Attendance, Break


class AttendanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'employee', 'date', 'status', 'check_in_time', 'check_out_time'
        ]



class AttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'status', 'check_in_time', 'check_out_time'
        ]


class BreakSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Break
        fields = [
            'break_id', 'attendance', 'break_start_time', 'break_end_time', 
            'break_type', 'duration_minutes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['break_id', 'created_at', 'updated_at']


class BreakCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Break
        fields = ['attendance', 'break_type']


class AttendanceDetailSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField()
    employee_email = serializers.ReadOnlyField()
    department = serializers.ReadOnlyField()
    is_on_break = serializers.ReadOnlyField()
    current_break = BreakSerializer(read_only=True)
    total_break_minutes = serializers.ReadOnlyField()
    breaks = BreakSerializer(many=True, read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'employee', 'employee_name', 'employee_email', 
            'department', 'date', 'status', 'check_in_time', 'check_out_time',
            'is_on_break', 'current_break', 'total_break_minutes', 'breaks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['attendance_id', 'created_at', 'updated_at']


class AttendanceListSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField()
    employee_email = serializers.ReadOnlyField()
    department = serializers.ReadOnlyField()
    
    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'employee', 'employee_name', 'employee_email', 
            'department', 'date', 'status', 'check_in_time', 'check_out_time'
        ]
