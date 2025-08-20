from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Attendance
from .serializers import (
    AttendanceCreateSerializer,
    AttendanceUpdateSerializer,
    AttendanceDetailSerializer,
    AttendanceListSerializer
)


class AttendanceCreateView(generics.CreateAPIView):
    queryset = Attendance.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = AttendanceCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            attendance = serializer.save()
            detail_serializer = AttendanceDetailSerializer(attendance)
            return Response({
                'message': 'Attendance marked successfully',
                'attendance': detail_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Attendance marking failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AttendanceListView(generics.ListAPIView):
    queryset = Attendance.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = AttendanceListSerializer


class AttendanceDetailView(generics.RetrieveUpdateAPIView):
    queryset = Attendance.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = AttendanceDetailSerializer

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AttendanceUpdateSerializer
        return AttendanceDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            attendance = serializer.save()
            detail_serializer = AttendanceDetailSerializer(attendance)
            return Response({
                'message': 'Attendance updated successfully',
                'attendance': detail_serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'message': 'Attendance update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_by_employee(request, employee_id):
    """Get attendance records for a specific employee"""
    try:
        attendances = Attendance.objects.filter(employee_id=employee_id).order_by('-date')
        serializer = AttendanceListSerializer(attendances, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({
            'message': 'Error fetching attendance records',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_by_date_range(request):
    """Get attendance records for a specific date range"""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        return Response({
            'message': 'Both start_date and end_date are required',
            'error': 'Query parameters missing'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Parse dates
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Validate date range
        if start_date > end_date:
            return Response({
                'message': 'Start date cannot be after end date',
                'error': 'Invalid date range'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendances = Attendance.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('-date', '-created_at')
        
        serializer = AttendanceListSerializer(attendances, many=True)
        return Response(serializer.data)
        
    except ValueError:
        return Response({
            'message': 'Invalid date format',
            'error': 'Use YYYY-MM-DD format for dates'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'message': 'Error fetching attendance records',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request, attendance_id):
    """Mark check-in time for an attendance record"""
    try:
        attendance = Attendance.objects.get(attendance_id=attendance_id)
        
        if attendance.check_in_time:
            return Response({
                'message': 'Check-in already recorded',
                'error': 'Employee has already checked in'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.check_in_time = timezone.now()
        attendance.save()
        
        serializer = AttendanceDetailSerializer(attendance)
        return Response({
            'message': 'Check-in recorded successfully',
            'attendance': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Attendance.DoesNotExist:
        return Response({
            'message': 'Attendance record not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error recording check-in',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request, attendance_id):
    """Mark check-out time for an attendance record"""
    try:
        attendance = Attendance.objects.get(attendance_id=attendance_id)
        
        if not attendance.check_in_time:
            return Response({
                'message': 'Check-out failed',
                'error': 'Employee must check in before checking out'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if attendance.check_out_time:
            return Response({
                'message': 'Check-out already recorded',
                'error': 'Employee has already checked out'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.check_out_time = timezone.now()
        attendance.save()
        
        serializer = AttendanceDetailSerializer(attendance)
        return Response({
            'message': 'Check-out recorded successfully',
            'attendance': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Attendance.DoesNotExist:
        return Response({
            'message': 'Attendance record not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error recording check-out',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_attendance(request):
    """Get today's attendance records"""
    today = timezone.now().date()
    attendances = Attendance.objects.filter(date=today).order_by('-created_at')
    serializer = AttendanceListSerializer(attendances, many=True)
    return Response(serializer.data)
