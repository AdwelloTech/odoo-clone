"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { employeeAPI, EmployeeProfile } from "@/app/api/employees";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [employeeProfile, setEmployeeProfile] =
    useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    dateOfBirth: "",
    location: "",
    manager: "",
    dateJoined: "",
    role: "",
    department: "",
  });

  // Fetch employee profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const profile = await employeeAPI.getCurrentUserProfile();
        setEmployeeProfile(profile);

        // Populate form data
        setFormData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          address: profile.address || "",
          phone: "", // Not available in current API
          dateOfBirth: "", // Not available in current API
          location: "", // Not available in current API
          manager: profile.manager ? profile.manager.name : "No Manager",
          dateJoined: profile.date_joined || "",
          role: profile.role?.name || "",
          department: profile.department?.name || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Here you would typically upload the image to your backend
    // For now, we'll just show the preview
    setIsUploadingImage(true);
    setTimeout(() => {
      setIsUploadingImage(false);
      // In a real implementation, you would call an API to upload the image
      // and then update the employeeProfile with the new image URL
    }, 1000);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getProfileImageUrl = () => {
    // First check if we have a preview (newly uploaded image)
    if (profileImagePreview) {
      return profileImagePreview;
    }

    // Then check if we have a profile image from the backend
    if (employeeProfile?.profile_image) {
      // Ensure the URL is valid and accessible
      try {
        const url = new URL(employeeProfile.profile_image);
        return employeeProfile.profile_image;
      } catch {
        // If it's not a valid URL, return null to show fallback
        return null;
      }
    }

    return null;
  };

  const getProfileInitials = () => {
    const firstName = formData.firstName || employeeProfile?.first_name || "";
    const lastName = formData.lastName || employeeProfile?.last_name || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }

    return "U"; // Default fallback
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Frontend validation
      if (!formData.firstName.trim()) {
        setError("First name cannot be empty");
        setIsLoading(false);
        return;
      }

      if (!formData.lastName.trim()) {
        setError("Last name cannot be empty");
        setIsLoading(false);
        return;
      }

      // Prepare the data to send to backend
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        address: formData.address.trim() || "",
      };

      // Update the profile in the backend
      const updatedProfile =
        await employeeAPI.updateCurrentUserProfile(updateData);

      // Update local state with the response from backend
      setEmployeeProfile(updatedProfile);

      // Update local form data to match the backend response
      setFormData((prev) => ({
        ...prev,
        firstName: updatedProfile.first_name || prev.firstName,
        lastName: updatedProfile.last_name || prev.lastName,
        address: updatedProfile.address || prev.address,
        email: updatedProfile.email || prev.email,
      }));

      // If we have a new profile image, you would also upload it here
      if (profileImagePreview) {
        console.log("New profile image to upload");
        // TODO: Call API to upload the new profile image
        // For now, we'll just clear the preview
        setProfileImagePreview(null);
      }

      setIsEditing(false);
      setError(null);
      setSuccessMessage("Profile updated successfully!");

      // Show success message (you could add a toast notification here)
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);

      // Handle specific error cases
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.errors) {
          // Backend validation errors
          const errorMessages = Object.values(
            axiosError.response.data.errors
          ).flat();
          setError(`Validation errors: ${errorMessages.join(", ")}`);
        } else if (axiosError.response?.data?.message) {
          // Backend error message
          setError(axiosError.response.data.message);
        } else {
          setError("Failed to save profile. Please try again.");
        }
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-white text-xl text-center">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <section className="relative bg-[#111111] min-h-screen">
        {/* Background Image */}
        <Image
          alt="bg"
          src="/bg-img.png"
          className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
          height={1080}
          width={1080}
        />

        <div className="relative z-10 p-4 lg:p-6">
          {/* Header */}
          <div className="max-w-6xl mx-auto w-full mb-6 lg:mb-8 mt-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-white text-3xl lg:text-4xl font-bold">
                adwello
              </h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white p-3 hover:bg-[#3D3D3D] rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 lg:w-7 lg:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation and Status Cards Row */}
            <div className="flex flex-col lg:flex-row justify-between items-center w-full mt-6 lg:mt-10 gap-4 lg:gap-0">
              {/* Navigation Buttons */}
              <div className="flex flex-col lg:flex-row gap-3 flex-1 w-full lg:w-auto">
                <button
                  onClick={() => router.push("/attendance")}
                  className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base"
                >
                  View Attendance
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Status Cards */}
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="max-w-6xl mx-auto w-full mb-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="max-w-6xl mx-auto w-full mb-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Main Content Container */}
          <div className="bg-[#3D3D3D] rounded-3xl overflow-hidden max-w-6xl mx-auto mt-8 mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-0">
              {/* Left Profile Panel */}
              <div className="lg:col-span-1 bg-[#3D3D3D] p-4 lg:p-6 pt-8 lg:pt-12 relative rounded-2xl">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setSuccessMessage(null); // Clear success message when starting to edit
                    setError(null); // Clear error message when starting to edit
                  }}
                  className="absolute top-4 right-4 text-white p-2 hover:bg-[#4B4A4A] rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6 lg:mb-8">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full mb-3 lg:mb-4 relative overflow-hidden bg-[#4B4A4A] group">
                    {/* Profile Image or Fallback */}
                    {getProfileImageUrl() ? (
                      <Image
                        src={getProfileImageUrl()!}
                        alt="Profile Picture"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                        onError={() => {
                          // If image fails to load, clear the URL to show fallback
                          setProfileImagePreview(null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl lg:text-3xl font-bold bg-gradient-to-br from-[#FF6300] to-[#C23732]">
                        {getProfileInitials()}
                      </div>
                    )}

                    {/* Upload Overlay - Only show when editing */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-center text-white">
                          <svg
                            className="w-8 h-8 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">Click to change</span>
                        </div>
                      </div>
                    )}

                    {/* Upload Button - Only show when editing */}
                    {isEditing && (
                      <button
                        onClick={triggerImageUpload}
                        className="absolute bottom-0 right-0 bg-[#FF6300] text-white p-2 rounded-full hover:bg-[#C23732] transition-colors shadow-lg"
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <h2 className="text-white text-lg lg:text-2xl font-bold mb-2 text-center">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-[#FF6300] text-sm lg:text-base font-medium text-center">
                    {formData.role || "Employee"}
                  </p>
                  <p className="text-gray-400 text-sm text-center mt-1">
                    {formData.department || "Department"}
                  </p>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3 lg:space-y-4 lg:mt-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setSuccessMessage(null); // Clear success message when starting to edit
                      setError(null); // Clear error message when starting to edit
                    }}
                    className="w-full bg-[#FF630059] text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-[#FF630070] transition-all duration-200 shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 lg:w-6 lg:h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-sm lg:text-base">
                      Personal information
                    </span>
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-[#3D3D3D] text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-[#4B4A4A] transition-all duration-200 shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 lg:w-6 lg:h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-sm lg:text-base">
                      Back to Dashboard
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-red-700 transition-all duration-200 shadow-lg"
                  >
                    <svg
                      className="w-5 h-5 lg:w-6 lg:h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-sm lg:text-base">
                      Log Out
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Personal Information Form */}
              <div className="lg:col-span-3 bg-[#4B4A4A] p-4 lg:p-8 pt-8 lg:pt-12 relative">
                <h3 className="text-white text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">
                  Personal Information
                </h3>

                <form className="space-y-4 lg:space-y-6">
                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        disabled={!isEditing}
                        className={`w-full px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-500 text-sm lg:text-base transition-all duration-200 ${
                          isEditing
                            ? "bg-[#00000026] text-[#A3A3A3] hover:bg-[#00000040]"
                            : "bg-[#00000010] text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        disabled={!isEditing}
                        className={`w-full px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-500 text-sm lg:text-base transition-all duration-200 ${
                          isEditing
                            ? "bg-[#00000026] text-[#A3A3A3] hover:bg-[#00000040]"
                            : "bg-[#00000010] text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      disabled={true} // Email should not be editable
                      className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      disabled={!isEditing}
                      className={`w-full px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-500 text-sm lg:text-base transition-all duration-200 ${
                        isEditing
                          ? "bg-[#00000026] text-[#A3A3A3] hover:bg-[#00000040]"
                          : "bg-[#00000010] text-gray-400 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* Phone Number and Date of Birth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Not available in current system"
                        disabled={true}
                        className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          placeholder="Not available in current system"
                          disabled={true}
                          className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base pr-10"
                        />
                        <svg
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Role and Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Job Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        placeholder="Your current job role"
                        disabled={true}
                        className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        placeholder="Your department"
                        disabled={true}
                        className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-600 my-8 opacity-50" />

                  {/* Manager and Date Joined */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Manager
                      </label>
                      <input
                        type="text"
                        name="manager"
                        value={formData.manager}
                        placeholder="Your direct manager"
                        disabled={true}
                        className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Date Joined
                      </label>
                      <input
                        type="text"
                        name="dateJoined"
                        value={formData.dateJoined}
                        placeholder="When you joined the company"
                        disabled={true}
                        className="w-full bg-[#00000010] text-gray-400 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none cursor-not-allowed text-sm lg:text-base"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-4 gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileImagePreview(null); // Reset image preview when canceling
                            setSuccessMessage(null); // Clear success message when canceling
                          }}
                          disabled={isLoading}
                          className="bg-[#3D3D3D] text-white px-8 py-2 lg:py-3 rounded-xl font-semibold hover:bg-[#4B4A4A] transition-all duration-200 shadow-lg text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-8 py-2 lg:py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg text-base lg:text-lg hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Saving..." : "Save"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-8 py-2 lg:py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg text-base lg:text-lg hover:scale-105 transform"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
};

export default ProfilePage;
