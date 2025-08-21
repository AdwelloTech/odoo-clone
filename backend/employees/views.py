from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from PIL import Image
from io import BytesIO
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


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_current_user_profile(request):
    """Update the current authenticated user's employee profile"""
    try:
        # Get the employee profile for the current authenticated user
        employee = Employee.objects.get(user=request.user)
        
        if not employee.is_active:
            return Response({
                'message': 'Employee profile is inactive',
                'error': 'Your employee profile has been deactivated'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the update serializer
        serializer = EmployeeUpdateSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            employee = serializer.save()
            profile_serializer = EmployeeProfileSerializer(employee)
            return Response({
                'message': 'Profile updated successfully',
                'employee': profile_serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Profile update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found',
            'error': 'No employee profile exists for this user'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error updating employee profile',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """Upload profile image for the current authenticated user"""
    try:
        # Get the employee profile for the current authenticated user
        employee = Employee.objects.get(user=request.user)
        
        if not employee.is_active:
            return Response({
                'message': 'Employee profile is inactive',
                'error': 'Your employee profile has been deactivated'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if image file is provided
        if 'image' not in request.FILES:
            return Response({
                'message': 'No image provided',
                'error': 'Please select an image file to upload'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response({
                'message': 'Invalid file type',
                'error': 'Please upload a JPEG, PNG, or WebP image'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            return Response({
                'message': 'File too large',
                'error': 'Please upload an image smaller than 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old profile image if it exists
        if employee.profile_image and default_storage.exists(employee.profile_image.name):
            default_storage.delete(employee.profile_image.name)
        
        # Process and resize image
        try:
            # Open image with PIL
            img = Image.open(image_file)
            
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Resize image to 400x400 while maintaining aspect ratio
            img.thumbnail((400, 400), Image.Resampling.LANCZOS)
            
            # Create a square image with white background
            square_img = Image.new('RGB', (400, 400), (255, 255, 255))
            
            # Calculate position to center the image
            x_offset = (400 - img.width) // 2
            y_offset = (400 - img.height) // 2
            
            # Paste the resized image onto the square background
            square_img.paste(img, (x_offset, y_offset))
            
            # Save processed image to BytesIO
            output = BytesIO()
            square_img.save(output, format='JPEG', quality=90, optimize=True)
            output.seek(0)
            
            # Generate unique filename
            file_extension = 'jpg'
            filename = f"profile_{employee.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
            file_path = f"profile_images/{filename}"
            
            # Save to storage
            saved_path = default_storage.save(file_path, ContentFile(output.read()))
            
            # Update employee profile
            employee.profile_image = saved_path
            employee.save()
            
            # Return updated profile data
            serializer = EmployeeProfileSerializer(employee)
            return Response({
                'message': 'Profile image uploaded successfully',
                'employee': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as img_error:
            return Response({
                'message': 'Error processing image',
                'error': f'Failed to process the uploaded image: {str(img_error)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Employee.DoesNotExist:
        return Response({
            'message': 'Employee profile not found',
            'error': 'No employee profile exists for this user'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'message': 'Error uploading profile image',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
