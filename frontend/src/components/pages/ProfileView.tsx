"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  XMarkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Safe Input wrapper to prevent fiber errors
const SafeInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return <Input ref={ref} className={className} {...props} />;
});
SafeInput.displayName = "SafeInput";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { employeeAPI, attendanceAPI } from "@/lib/api";
import { formatDate, getImageUrl } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Department {
  id: number;
  name: string;
  description: string;
}

interface JobRole {
  id: number;
  name: string;
  description: string;
  department: Department;
}

export const ProfileView: React.FC = () => {
  const { user, employee, refreshUserData } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    expected_hours: 8,
    role: 0,
  });

  // Initialize form data when employee data is available
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        address: (employee as any).address || "",
        expected_hours: employee.expected_hours || 8,
        role: employee.role?.id || 0,
      });
    }
  }, [employee]);

  // Fetch departments and job roles for editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, rolesData] = await Promise.all([
          employeeAPI.getDepartments(),
          employeeAPI.getJobRoles(),
        ]);

        setDepartments(deptData || []);
        setJobRoles(rolesData || []);
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
      }
    };

    if (isEditing) {
      fetchData();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        address: (employee as any).address || "",
        expected_hours: employee.expected_hours || 8,
        role: employee.role?.id || 0,
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await employeeAPI.updateProfile(formData);
      await refreshUserData();
      setIsEditing(false);
      addToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        message: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load today's attendance data
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (!employee?.id) return;

      try {
        setAttendanceLoading(true);
        const response = await attendanceAPI.getCurrentUserTodayAttendance();
        // Filter attendance records for current user
        const userAttendance = response.filter(
          (record: any) =>
            record.employee_id === employee.id ||
            record.employee === employee.id
        );
        setTodayAttendance(userAttendance);
      } catch (error) {
        console.error("Error loading today's attendance:", error);
        setTodayAttendance([]);
      } finally {
        setAttendanceLoading(false);
      }
    };

    loadTodayAttendance();
  }, [employee?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "expected_hours" || name === "role" ? Number(value) : value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const response = await employeeAPI.uploadProfileImage(file);
      await refreshUserData();
      setShowImageUpload(false);
      addToast({
        type: "success",
        title: "Profile Image Updated",
        message: "Your profile image has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      addToast({
        type: "error",
        title: "Upload Failed",
        message:
          error.response?.data?.error ||
          "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSelect = (file: File) => {
    // Optional: Show preview or validate file before upload
    console.log("Image selected:", file.name);
  };

  if (!user || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-7xl mx-auto relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="max-w-screen-7xl">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-200 mt-1">
            Manage your personal information and settings
          </p>
        </div>

        {!isEditing ? (
          <Button
            onClick={handleEdit}
            variant="outline"
            className="flex items-center bg-gradient-to-r from-[#FF6300] to-[#C23732] hover:bg-[#FF6800]/80 transition-colors border-none text-white cursor-pointer"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isLoading}
              className="bg-transparent border-white text-white hover:bg-gray-100 hover:text-black cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-gradient-to-r from-[#FF6300] to-[#C23732] hover:bg-[#FF3800]/80 shadow-none transition-all duration-300"
              onClick={handleSave}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="bg-[#1F232B] border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block">
                  <ImageWithFallback
                    src={
                      (employee as any).profile_image || "/default-avatar.png"
                    }
                    alt={employee.full_name}
                    size="xl"
                    className="border-4 border-white mx-auto"
                  />

                  <Button
                    className=" shadow-none absolute w-10 h-10 cursor-pointer bottom-0 right-0 bg-[#FF6300] text-white p-2 rounded-full shadow-lg hover:bg-[#FF6800]/80 transition-colors"
                    onClick={() => setShowImageUpload(true)}
                  >
                    <CameraIcon className="w-4 h-4 cursor-pointer text-white shadow-none" />
                  </Button>
                </div>

                {/* Image Upload Modal */}
                <AnimatePresence>
                  {showImageUpload && (
                    <div className="fixed inset-0 bg-black/60 bg-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-50 text-white rounded-xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            Upload Profile Image
                          </h3>
                          <Button
                            onClick={() => setShowImageUpload(false)}
                            className="text-black hover:text-gray-600 bg-transparent cursor-pointer hover:bg-transparent shadow-none"
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </Button>
                        </div>

                        <ImageUpload
                          onImageSelect={handleImageSelect}
                          onUpload={handleImageUpload}
                          isUploading={isUploadingImage}
                          maxSizeInMB={5}
                          className=""
                        />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Name and Role */}
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-white">
                    {employee.full_name}
                  </h2>
                  <p className="text-[#F85E07] font-medium">
                    {employee.role?.name}
                  </p>
                  <p className="text-gray-200 text-sm">
                    {employee.role?.department?.name}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-5 py-1 rounded-xl text-sm font-semibold ${
                      employee.is_active
                        ? "bg-[#FF630059] text-white"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4 bg-[#1F232B] border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-white">
                <ChartBarIcon className="w-5 h-5 mr-2 text-[#FF6300]" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Date Joined */}
              <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <CalendarDaysIcon className="w-4 h-4 text-white mr-2" />
                  <span className="text-sm font-medium text-white">
                    Date Joined
                  </span>
                </div>
                <p className="text-lg font-semibold text-white mr-2">
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(employee.date_joined))}
                </p>
              </div>

              {/* Expected Hours */}
              <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <ClockIcon className="w-4 h-4 text-white mr-2" />
                  <span className="text-sm font-medium text-white">
                    Expected Hours
                  </span>
                </div>
                <p className="text-lg font-semibold text-white mr-2">
                  {employee.expected_hours} hours per day
                </p>
              </div>

              {/* Department Info */}
              <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-white mr-2" />
                  <span className="text-sm font-medium text-white">
                    Department
                  </span>
                </div>
                <p className="text-lg font-semibold text-white mr-2">
                  {employee.role?.department?.name}
                </p>
                {employee.role?.department?.description && (
                  <p className="text-sm text-white mt-1">
                    {employee.role?.department?.description}
                  </p>
                )}
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
          <Card className="bg-[#1F232B] border-none shadow-sm ">
            <CardHeader>
              <CardTitle className="flex items-center text-white font-semibold text-lg mb-7">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 ">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>

                  <SafeInput
                    key="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    readOnly={!isEditing}
                    className={`backdrop-blur-md border-white/20 text-white placeholder:text-white/60 transition-all duration-300 ${
                      isEditing
                        ? "bg-white/10 focus:bg-white/15 focus:border-white/40 focus-visible:ring-white/30 cursor-text"
                        : "bg-white/5 border-white/10 cursor-default"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <SafeInput
                    key="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    readOnly={!isEditing}
                    className={`backdrop-blur-md border-white/20 text-white placeholder:text-white/60 transition-all duration-300 ${
                      isEditing
                        ? "bg-white/10 focus:bg-white/15 focus:border-white/40 focus-visible:ring-white/30 cursor-text"
                        : "bg-white/5 border-white/10 cursor-default"
                    }`}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className=" pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <SafeInput
                        value={employee.email}
                        readOnly
                        className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default pl-10"
                      />
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-white mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <SafeInput
                        value={(user as any).phone_number || "Not provided"}
                        readOnly
                        className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default pl-10"
                      />
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Address
                  </label>
                  <SafeInput
                    key="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    readOnly={!isEditing}
                    className={`backdrop-blur-md border-white/20 text-white placeholder:text-white/60 transition-all duration-300 ${
                      isEditing
                        ? "bg-white/10 focus:bg-white/15 focus:border-white/40 focus-visible:ring-white/30 cursor-text"
                        : "bg-white/5 border-white/10 cursor-default"
                    }`}
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Department
                    </label>
                    <SafeInput
                      value={employee.role?.department?.name || ""}
                      readOnly
                      className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Job Role
                    </label>

                    <SafeInput
                      value={employee.role?.name || ""}
                      readOnly
                      className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Expected Hours per Day
                    </label>

                    <div className="relative">
                      <SafeInput
                        value={`${employee.expected_hours} hours`}
                        readOnly
                        className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default pl-10"
                      />
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                    </div>
                  </div>

                  {employee.manager && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Manager
                      </label>
                      <div className="relative">
                        <SafeInput
                          value={employee.manager.name}
                          readOnly
                          className="bg-white/5 backdrop-blur-sm border-white/10 text-white cursor-default pl-10"
                        />
                        <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-green-600" />
              Today's Attendance
              <span className="ml-auto text-sm font-normal text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading attendance data...
                </span>
              </div>
            ) : todayAttendance.length > 0 ? (
              <div className="space-y-6">
                {todayAttendance.map((attendance: any, index: number) => (
                  <div key={attendance.attendance_id} className="relative">
                    
                    {index < todayAttendance.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-20 bg-gray-200"></div>
                    )}

                    <div className="flex items-start space-x-4">
         \
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          attendance.status === "PRESENT"
                            ? "bg-green-100"
                            : attendance.status === "LATE"
                            ? "bg-yellow-100"
                            : attendance.status === "ABSENT"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {attendance.status === "PRESENT" ? (
                          <CheckIcon className={`w-6 h-6 text-green-600`} />
                        ) : attendance.status === "LATE" ? (
                          <ClockIcon className={`w-6 h-6 text-yellow-600`} />
                        ) : attendance.status === "ABSENT" ? (
                          <XMarkIcon className={`w-6 h-6 text-red-600`} />
                        ) : (
                          <ClockIcon className={`w-6 h-6 text-blue-600`} />
                        )}
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            Status: {attendance.status}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === "PRESENT"
                                ? "bg-green-100 text-green-800"
                                : attendance.status === "LATE"
                                ? "bg-yellow-100 text-yellow-800"
                                : attendance.status === "ABSENT"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {attendance.status}
                          </span>
                        </div>

            
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {attendance.check_in_time && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Check In
                                </p>
                                <p className="text-lg font-semibold text-green-600">
                                  {new Date(
                                    attendance.check_in_time
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                          )}

                          {attendance.check_out_time && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Check Out
                                </p>
                                <p className="text-lg font-semibold text-red-600">
                                  {new Date(
                                    attendance.check_out_time
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

      
                        {attendance.check_in_time &&
                          attendance.check_out_time && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-700">
                                  Total Work Time
                                </span>
                                <span className="text-lg font-bold text-blue-800">
                                  {(() => {
                                    const checkIn = new Date(
                                      attendance.check_in_time
                                    );
                                    const checkOut = new Date(
                                      attendance.check_out_time
                                    );
                                    const diffMs =
                                      checkOut.getTime() - checkIn.getTime();
                                    const hours = Math.floor(
                                      diffMs / (1000 * 60 * 60)
                                    );
                                    const minutes = Math.floor(
                                      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                                    );
                                    return `${hours}h ${minutes}m`;
                                  })()}
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No attendance recorded today
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't clocked in yet today. Start tracking your time!
                </p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Clock In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>*/}
    </div>
  );
};
