"use client";

import React, { useState } from "react";
import Image from "next/image";

const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: "Sajad",
        lastName: "Ahamed",
        email: "sajad@example.com",
        address: "123 Main Street",
        phone: "+1 234 567 8900",
        dateOfBirth: "1990-01-01",
        location: "New York",
        manager: "John Doe",
        dateJoined: "Date Joined"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // Handle save functionality
        console.log("Saving profile data:", formData);
    };

    return (
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
                        <h1 className="text-white text-3xl lg:text-4xl font-bold">adwello</h1>
                        <button className="text-white p-3 hover:bg-[#3D3D3D] rounded-lg transition-colors">
                            <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation and Status Cards Row */}
                    <div className="flex flex-col lg:flex-row justify-between items-center w-full mt-6 lg:mt-10 gap-4 lg:gap-0">
                        {/* Navigation Buttons */}
                        <div className="flex flex-col lg:flex-row gap-3 flex-1 w-full lg:w-auto">
                            <button className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base">
                                Request Time off
                            </button>
                            <button className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity h-10 lg:h-12 flex items-center justify-center text-sm lg:text-base">
                                Request Allocation
                            </button>
                            <button className="bg-[#3D3D3D] text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity h-10 lg:h-12 flex items-center justify-center text-sm whitespace-nowrap">
                                Deduct Extra Hours
                            </button>
                        </div>

                        {/* Status Cards */}
                        <div className="flex gap-3 justify-center lg:justify-end w-full lg:w-auto lg:ml-6">
                            <div className="text-white p-2 lg:p-3 rounded-lg border border-white w-32 lg:w-36 h-10 lg:h-12 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 lg:gap-2 mb-1">
                                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs">This Month</span>
                                </div>
                                <div className="text-xs font-semibold">114:55 Hours</div>
                            </div>
                            <div className="text-white p-2 lg:p-3 rounded-lg border border-white w-32 lg:w-36 h-10 lg:h-12 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 lg:gap-2 mb-1">
                                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs">Time Off</span>
                                </div>
                                <div className="text-xs font-semibold">0/0 Days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="bg-[#3D3D3D] rounded-3xl overflow-hidden max-w-6xl mx-auto mt-8 mb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-0">
                        {/* Left Profile Panel */}
                        <div className="lg:col-span-1 bg-[#3D3D3D] p-4 lg:p-6 pt-8 lg:pt-12 relative rounded-2xl">
                            <button className="absolute top-4 right-4 text-white p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            

                            {/* Profile Picture */}
                            <div className="flex flex-col items-center mb-6 lg:mb-8">
                                <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full mb-3 lg:mb-4 relative overflow-hidden">
                                    <Image
                                        src="/sansuka.jpg"
                                        alt="Profile Picture"
                                        width={112}
                                        height={112}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h2 className="text-white text-lg lg:text-2xl font-bold mb-2 text-center">Sajad Ahamed</h2>
                                <p className="text-[#FF6300] text-sm lg:text-base font-medium text-center">UI/UX Designer</p>
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-3 lg:space-y-4 lg:mt-10">
                                <button className="w-full bg-[#FF630059] text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-[#FF630070] transition-all duration-200 shadow-lg">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-sm lg:text-base">Personal information</span>
                                </button>
                                <button className="w-full bg-[#3D3D3D] text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-[#4B4A4A] transition-all duration-200 shadow-lg">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-sm lg:text-base">Log in & Password</span>
                                </button>
                                <button className="w-full bg-[#3D3D3D] text-white px-3 lg:px-4 py-3 lg:py-4 rounded-2xl lg:rounded-3xl flex items-center gap-2 lg:gap-3 hover:bg-[#4B4A4A] transition-all duration-200 shadow-lg">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-sm lg:text-base">Log Out</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Personal Information Form */}
                        <div className="lg:col-span-3 bg-[#4B4A4A] p-4 lg:p-8 pt-8 lg:pt-12 relative">
                            <button className="absolute top-4 right-4 text-white p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            <h3 className="text-white text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">Personal Information</h3>

                            <form className="space-y-4 lg:space-y-6">
                                {/* First Name and Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="First Name"
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Last Name"
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                        className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Address"
                                        className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                    />
                                </div>

                                {/* Phone Number and Date of Birth */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    <div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Phone Number"
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            placeholder="Date of Birth"
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040] pr-10"
                                        />
                                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="relative">
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] appearance-none text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                    >
                                        <option value="New York">New York</option>
                                        <option value="Los Angeles">Los Angeles</option>
                                        <option value="Chicago">Chicago</option>
                                        <option value="Houston">Houston</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* Divider */}
                                <hr className="border-gray-600 my-8 opacity-50" />

                                {/* Manager and Date Joined */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="manager"
                                            value={formData.manager}
                                            onChange={handleInputChange}
                                            placeholder="Manager"
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="dateJoined"
                                            value={formData.dateJoined}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#00000026] text-[#A3A3A3] px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-[#FF6300] placeholder-gray-400 text-sm lg:text-base transition-all duration-200 hover:bg-[#00000040]"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white px-12 lg:px-24 py-2 lg:py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg text-base lg:text-lg hover:scale-105 transform"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;
