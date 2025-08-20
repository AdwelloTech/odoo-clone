'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon, 
  PencilIcon, 
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { useAuth } from '@/contexts/AuthContext'
import { employeeAPI } from '@/lib/api'
import { formatDate, getImageUrl } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface Department {
  id: number
  name: string
  description: string
}

interface JobRole {
  id: number
  name: string
  description: string
  department: Department
}

export const ProfileView: React.FC = () => {
  const { user, employee, refreshUserData } = useAuth()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    expected_hours: 8,
    role: 0,
  })

  // Initialize form data when employee data is available
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        address: employee.address || '',
        expected_hours: employee.expected_hours || 8,
        role: employee.role?.id || 0,
      })
    }
  }, [employee])

  // Fetch departments and job roles for editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, rolesData] = await Promise.all([
          employeeAPI.getDepartments(),
          employeeAPI.getJobRoles()
        ])
        
        setDepartments(deptData || [])
        setJobRoles(rolesData || [])
      } catch (error) {
        console.error('Failed to fetch reference data:', error)
      }
    }

    if (isEditing) {
      fetchData()
    }
  }, [isEditing])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        address: employee.address || '',
        expected_hours: employee.expected_hours || 8,
        role: employee.role?.id || 0,
      })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await employeeAPI.updateProfile(formData)
      await refreshUserData()
      setIsEditing(false)
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'There was an error updating your profile. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expected_hours' || name === 'role' ? Number(value) : value
    }))
  }

  if (!user || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" className="flex items-center">
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={isLoading}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              variant="default"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block">
                  <ImageWithFallback
                    src={employee.profile_image}
                    alt={employee.full_name}
                    size="xl"
                    className="border-4 border-white shadow-lg mx-auto"
                  />
                  
                  {isEditing && (
                    <button 
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        // TODO: Implement image upload functionality
                        addToast({
                          type: 'info',
                          title: 'Image Upload',
                          message: 'Image upload functionality will be available soon.',
                        });
                      }}
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Name and Role */}
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {employee.full_name}
                  </h2>
                  <p className="text-blue-600 font-medium">
                    {employee.role?.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {employee.role?.department?.name}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    employee.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Joined</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(new Date(employee.date_joined))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Expected Hours</span>
                </div>
                <span className="text-sm font-medium">
                  {employee.expected_hours}h/day
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{employee.first_name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{employee.last_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <EnvelopeIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">{employee.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <PhoneIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">
                        {user.phone_number || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">
                        {employee.address || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">{employee.role?.department?.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Role
                    </label>
                    {isEditing ? (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a role</option>
                        {jobRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} - {role.department.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{employee.role?.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Hours per Day
                    </label>
                    {isEditing ? (
                      <Input
                        name="expected_hours"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.expected_hours}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <ClockIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-900">{employee.expected_hours} hours</span>
                      </div>
                    )}
                  </div>

                  {employee.manager && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <UserCircleIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-900">{employee.manager.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
