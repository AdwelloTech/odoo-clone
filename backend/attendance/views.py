from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Attendance, Break
from .serializers import (
    AttendanceCreateSerializer,
    AttendanceUpdateSerializer,
    AttendanceDetailSerializer,
    AttendanceListSerializer,
    BreakSerializer,
    BreakCreateSerializer
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_attendance_status(request):
    """Get current user's active attendance session if any"""
    try:
        # Get the current user's employee record
        from employees.models import Employee
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({
                'message': 'Employee record not found',
                'is_clocked_in': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Look for an active attendance session (checked in but not checked out)
        active_attendance = Attendance.objects.filter(
            employee=employee,
            check_in_time__isnull=False,
            check_out_time__isnull=True
        ).order_by('-check_in_time').first()
        
        if active_attendance:
            # User is currently clocked in
            serializer = AttendanceDetailSerializer(active_attendance)
            return Response({
                'message': 'User is currently clocked in',
                'is_clocked_in': True,
                'is_on_break': active_attendance.is_on_break,
                'attendance': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            # User is not clocked in
            return Response({
                'message': 'User is not currently clocked in',
                'is_clocked_in': False
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'message': 'Error checking attendance status',
            'error': str(e),
            'is_clocked_in': False
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_break(request, attendance_id):
    """Start a break for an attendance session"""
    try:
        attendance = Attendance.objects.get(attendance_id=attendance_id)
        
        # Check if user is the owner of this attendance record
        from employees.models import Employee
        try:
            employee = Employee.objects.get(user=request.user)
            if attendance.employee != employee:
                return Response({
                    'message': 'Unauthorized access to attendance record'
                }, status=status.HTTP_403_FORBIDDEN)
        except Employee.DoesNotExist:
            return Response({
                'message': 'Employee record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already on break
        if attendance.is_on_break:
            return Response({
                'message': 'Break already in progress',
                'error': 'Employee is already on break'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if attendance session is active (checked in but not out)
        if not attendance.check_in_time or attendance.check_out_time:
            return Response({
                'message': 'Cannot start break',
                'error': 'No active attendance session'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create break record
        break_data = {
            'attendance': attendance.attendance_id,
            'break_type': request.data.get('break_type', 'Regular')
        }
        break_serializer = BreakCreateSerializer(data=break_data)
        
        if break_serializer.is_valid():
            break_instance = break_serializer.save(break_start_time=timezone.now())
            response_serializer = BreakSerializer(break_instance)
            
            # Also return updated attendance info
            attendance_serializer = AttendanceDetailSerializer(attendance)
            
            return Response({
                'message': 'Break started successfully',
                'break': response_serializer.data,
                'attendance': attendance_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Failed to start break',
            'errors': break_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Attendance.DoesNotExist:
        return Response({
            'message': 'Attendance record not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error starting break',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_break(request, attendance_id):
    """End the current break for an attendance session"""
    try:
        attendance = Attendance.objects.get(attendance_id=attendance_id)
        
        # Check if user is the owner of this attendance record
        from employees.models import Employee
        try:
            employee = Employee.objects.get(user=request.user)
            if attendance.employee != employee:
                return Response({
                    'message': 'Unauthorized access to attendance record'
                }, status=status.HTTP_403_FORBIDDEN)
        except Employee.DoesNotExist:
            return Response({
                'message': 'Employee record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if currently on break
        if not attendance.is_on_break:
            return Response({
                'message': 'No active break to end',
                'error': 'Employee is not currently on break'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get current break and end it
        current_break = attendance.current_break
        current_break.break_end_time = timezone.now()
        current_break.save()
        
        response_serializer = BreakSerializer(current_break)
        
        # Also return updated attendance info
        attendance_serializer = AttendanceDetailSerializer(attendance)
        
        return Response({
            'message': 'Break ended successfully',
            'break': response_serializer.data,
            'attendance': attendance_serializer.data
        }, status=status.HTTP_200_OK)
        
    except Attendance.DoesNotExist:
        return Response({
            'message': 'Attendance record not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error ending break',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_breaks(request, attendance_id):
    """Get all breaks for a specific attendance session"""
    try:
        attendance = Attendance.objects.get(attendance_id=attendance_id)
        
        # Check if user is the owner of this attendance record
        from employees.models import Employee
        try:
            employee = Employee.objects.get(user=request.user)
            if attendance.employee != employee:
                return Response({
                    'message': 'Unauthorized access to attendance record'
                }, status=status.HTTP_403_FORBIDDEN)
        except Employee.DoesNotExist:
            return Response({
                'message': 'Employee record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        breaks = attendance.breaks.all()
        serializer = BreakSerializer(breaks, many=True)
        
        return Response({
            'breaks': serializer.data,
            'total_break_minutes': attendance.total_break_minutes,
            'is_on_break': attendance.is_on_break
        }, status=status.HTTP_200_OK)
        
    except Attendance.DoesNotExist:
        return Response({
            'message': 'Attendance record not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error fetching breaks',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
