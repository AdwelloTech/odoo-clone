'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime, getGreeting } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceAPI } from '@/lib/api'

interface TimeTrackerProps {
  onStatusChange?: (status: 'idle' | 'working' | 'break') => void
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ onStatusChange }) => {
  const { user, employee } = useAuth()
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [status, setStatus] = useState<'idle' | 'working' | 'break'>('idle')
  const [currentAttendanceId, setCurrentAttendanceId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === 'working') {
      interval = setInterval(() => {
        if (startTime) {
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
          setTimeElapsed(elapsed)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, startTime])

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  const handleClockIn = async () => {
    if (!employee) return

    setIsLoading(true)
    try {
      // Create attendance record
      const attendanceData = {
        employee: employee.id,
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
      }

      const createResponse = await attendanceAPI.createAttendance(attendanceData)
      
      if (createResponse.attendance) {
        const attendanceId = createResponse.attendance.attendance_id
        
        // Check in
        await attendanceAPI.checkIn(attendanceId)
        
        setCurrentAttendanceId(attendanceId)
        setStatus('working')
        setStartTime(new Date())
        setTimeElapsed(0)
      }
    } catch (error) {
      console.error('Failed to clock in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!currentAttendanceId) return

    setIsLoading(true)
    try {
      await attendanceAPI.checkOut(currentAttendanceId)
      setStatus('idle')
      setCurrentAttendanceId(null)
      setStartTime(null)
      setTimeElapsed(0)
    } catch (error) {
      console.error('Failed to clock out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBreak = () => {
    setStatus(status === 'break' ? 'working' : 'break')
  }

  const getStatusColor = () => {
    switch (status) {
      case 'working':
        return 'text-green-600'
      case 'break':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'working':
        return 'Working'
      case 'break':
        return 'On Break'
      default:
        return 'Not Clocked In'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.first_name || 'User'}!
        </CardTitle>
        <p className="text-sm text-gray-600">
          {employee?.role?.name} • {employee?.role?.department?.name}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <motion.div
            className="relative w-48 h-48 mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Circular Progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={status === 'working' ? '#10b981' : status === 'break' ? '#f59e0b' : '#6b7280'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={2 * Math.PI * 80 * (1 - (timeElapsed % 3600) / 3600)}
                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (timeElapsed % 3600) / 3600) }}
                transition={{ duration: 1 }}
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900 font-mono">
                {formatTime(timeElapsed)}
              </div>
              <div className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {status === 'idle' ? (
            <Button
              onClick={handleClockIn}
              disabled={isLoading}
              size="lg"
              className="w-full"
              variant="success"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              {isLoading ? 'Clocking In...' : 'Clock In'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  onClick={handleBreak}
                  disabled={isLoading}
                  variant={status === 'break' ? 'default' : 'warning'}
                  size="lg"
                  className="flex-1"
                >
                  {status === 'break' ? (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="w-5 h-5 mr-2" />
                      Break
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClockOut}
                  disabled={isLoading}
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  {isLoading ? 'Clocking Out...' : 'Clock Out'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Today's Goal */}
        {employee && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                Today&apos;s Goal
              </div>
              <div className="font-medium text-gray-900">
                {employee.expected_hours}h
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((timeElapsed / 3600 / employee.expected_hours) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
