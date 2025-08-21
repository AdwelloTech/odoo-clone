from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, date
from .models import Task, TaskSession
from .serializers import (
    TaskCreateSerializer, TaskUpdateSerializer, TaskDetailSerializer,
    TaskListSerializer, TaskSessionSerializer, TaskSessionCreateSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    """Get current user's tasks"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        # Get query parameters
        task_date = request.GET.get('date')
        task_status = request.GET.get('status')
        
        # Build query
        tasks = Task.objects.filter(employee=employee)
        
        if task_date:
            try:
                date_obj = datetime.strptime(task_date, '%Y-%m-%d').date()
                tasks = tasks.filter(task_date=date_obj)
            except ValueError:
                return Response({
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if task_status:
            tasks = tasks.filter(status=task_status)
        
        tasks = tasks.order_by('-task_date', '-created_at')
        serializer = TaskListSerializer(tasks, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error fetching tasks',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task(request):
    """Create a new task"""
    try:
        serializer = TaskCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            task = serializer.save()
            response_serializer = TaskDetailSerializer(task)
            
            return Response({
                'message': 'Task created successfully',
                'task': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Failed to create task',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'message': 'Error creating task',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_detail(request, task_id):
    """Get task details"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        task = Task.objects.get(task_id=task_id, employee=employee)
        serializer = TaskDetailSerializer(task)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({
            'message': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error fetching task',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_task(request, task_id):
    """Update a task"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        task = Task.objects.get(task_id=task_id, employee=employee)
        serializer = TaskUpdateSerializer(task, data=request.data, partial=request.method == 'PATCH')
        
        if serializer.is_valid():
            updated_task = serializer.save()
            response_serializer = TaskDetailSerializer(updated_task)
            
            return Response({
                'message': 'Task updated successfully',
                'task': response_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Failed to update task',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({
            'message': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error updating task',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):
    """Delete a task"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        task = Task.objects.get(task_id=task_id, employee=employee)
        task.delete()
        
        return Response({
            'message': 'Task deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({
            'message': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error deleting task',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_task(request, task_id):
    """Start working on a task"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        task = Task.objects.get(task_id=task_id, employee=employee)
        
        # Check if task already has an active session
        if task.is_active:
            return Response({
                'message': 'Task already has an active session',
                'task': TaskDetailSerializer(task).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get current attendance session if available
        from attendance.models import Attendance
        current_attendance = Attendance.objects.filter(
            employee=employee,
            check_in_time__isnull=False,
            check_out_time__isnull=True
        ).first()
        
        # Create new task session
        session_data = {
            'task': task.task_id,
            'attendance': current_attendance.attendance_id if current_attendance else None,
            'notes': request.data.get('notes', '')
        }
        
        session_serializer = TaskSessionCreateSerializer(data=session_data)
        
        if session_serializer.is_valid():
            session = session_serializer.save(start_time=timezone.now())
            
            # Update task status to in_progress if it was pending
            if task.status == 'pending':
                task.status = 'in_progress'
                task.save()
            
            response_serializer = TaskDetailSerializer(task)
            
            return Response({
                'message': 'Task session started successfully',
                'task': response_serializer.data,
                'session': TaskSessionSerializer(session).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Failed to start task session',
            'errors': session_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({
            'message': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error starting task session',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_task(request, task_id):
    """Stop working on a task"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        task = Task.objects.get(task_id=task_id, employee=employee)
        
        # Check if task has an active session
        if not task.is_active:
            return Response({
                'message': 'Task does not have an active session'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get and end the current session
        current_session = task.current_session
        current_session.end_time = timezone.now()
        current_session.notes = request.data.get('notes', current_session.notes or '')
        current_session.save()
        
        # Check if task should be marked as completed
        task_status = request.data.get('task_status')
        if task_status and task_status in ['completed', 'cancelled', 'pending']:
            task.status = task_status
            task.save()
        
        response_serializer = TaskDetailSerializer(task)
        
        return Response({
            'message': 'Task session stopped successfully',
            'task': response_serializer.data,
            'session': TaskSessionSerializer(current_session).data
        }, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({
            'message': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error stopping task session',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_today_tasks(request):
    """Get current user's tasks for today"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        today = date.today()
        tasks = Task.objects.filter(
            employee=employee,
            task_date=today
        ).order_by('-created_at')
        
        serializer = TaskListSerializer(tasks, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error fetching today\'s tasks',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_task(request):
    """Get current user's active task if any"""
    try:
        from employees.models import Employee
        employee = Employee.objects.get(user=request.user)
        
        active_task = Task.objects.filter(
            employee=employee,
            sessions__end_time__isnull=True
        ).first()
        
        if active_task:
            serializer = TaskDetailSerializer(active_task)
            return Response({
                'has_active_task': True,
                'task': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'has_active_task': False,
                'task': None
            }, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error fetching active task',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
