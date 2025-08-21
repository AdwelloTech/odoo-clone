'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { TimeTracker } from '@/components/time-tracking/TimeTracker'
import { AttendanceOverview } from '@/components/time-tracking/AttendanceOverview'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/LoginForm'

export default function TimeTrackingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'working' | 'break'>('idle')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
              <p className="text-gray-600 mt-2">Track your work hours and manage your attendance</p>
            </motion.div>

            <div className="space-y-8">
              {/* Top Section: Time Tracker and Attendance Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
              >
                {/* Time Tracker - Left Side */}
                <div className="flex justify-center">
                  <div className="sticky top-6 w-full max-w-md">
                    <TimeTracker onStatusChange={setCurrentStatus} />
                  </div>
                </div>

                {/* Attendance Overview - Right Side */}
                <div className="flex flex-col">
                  <AttendanceOverview currentStatus={currentStatus} />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
