from rest_framework import serializers
from .models import Attendance


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


class AttendanceDetailSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField()
    employee_email = serializers.ReadOnlyField()
    department = serializers.ReadOnlyField()
    
    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'employee', 'employee_name', 'employee_email', 
            'department', 'date', 'status', 'check_in_time', 'check_out_time',
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
