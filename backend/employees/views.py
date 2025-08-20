from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Employee, JobRole, Department
from .serializers import (
    EmployeeCreateSerializer, 
    EmployeeUpdateSerializer,
    EmployeeProfileSerializer,
    EmployeeListSerializer,
    JobRoleSerializer,
    DepartmentSerializer
)

User = get_user_model()


class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = DepartmentSerializer


class DepartmentDetailView(generics.RetrieveAPIView):
    queryset = Department.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = DepartmentSerializer


class JobRoleListView(generics.ListAPIView):
    queryset = JobRole.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = JobRoleSerializer


class JobRoleDetailView(generics.RetrieveAPIView):
    queryset = JobRole.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = JobRoleSerializer


class EmployeeCreateView(generics.CreateAPIView):
    queryset = Employee.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = EmployeeCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            profile_serializer = EmployeeProfileSerializer(employee)
            return Response({
                'message': 'Employee created successfully',
                'employee': profile_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Employee creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmployeeListView(generics.ListAPIView):
    queryset = Employee.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = EmployeeListSerializer


class EmployeeDetailView(generics.RetrieveUpdateAPIView):
    queryset = Employee.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = EmployeeProfileSerializer

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EmployeeUpdateSerializer
        return EmployeeProfileSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            employee = serializer.save()
            profile_serializer = EmployeeProfileSerializer(employee)
            return Response({
                'message': 'Employee updated successfully',
                'employee': profile_serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'message': 'Employee update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def employee_delete(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
        employee.is_active = False
        employee.save()
        return Response({
            'message': 'Employee deactivated successfully'
        }, status=status.HTTP_200_OK)
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_active(request):
    active_employees = Employee.objects.filter(is_active=True)
    serializer = EmployeeListSerializer(active_employees, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_inactive(request):
    inactive_employees = Employee.objects.filter(is_active=False)
    serializer = EmployeeListSerializer(inactive_employees, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def employee_reactivate(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
        if employee.is_active:
            return Response({
                'message': 'Employee is already active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        employee.is_active = True
        employee.save()
        serializer = EmployeeProfileSerializer(employee)
        return Response({
            'message': 'Employee reactivated successfully',
            'employee': serializer.data
        }, status=status.HTTP_200_OK)
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_employee_profile(request):
    """Get the current authenticated user's employee profile"""
    try:
        # Get the employee profile for the current authenticated user
        employee = Employee.objects.get(user=request.user)
        
        if not employee.is_active:
            return Response({
                'message': 'Employee profile is inactive',
                'error': 'Your employee profile has been deactivated'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EmployeeProfileSerializer(employee)
        return Response({
            'message': 'Employee profile retrieved successfully',
            'employee': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found',
            'error': 'No employee profile exists for this user'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error retrieving employee profile',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
