'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PauseIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceAPI } from '@/lib/api'
import { formatDuration } from '@/lib/utils'

interface Break {
  break_id: number
  break_start_time: string
  break_end_time: string | null
  break_type: string
  duration_minutes: number | null
  is_active: boolean
}

interface AttendanceWithBreaks {
  attendance_id: number
  employee_name: string
  date: string
  check_in_time: string | null
  check_out_time: string | null
  total_break_minutes: number
  actual_work_minutes: number
  current_break_minutes: number
  breaks: Break[]
  is_on_break: boolean
}

interface DayBreakSummary {
  totalBreaks: number
  totalBreakMinutes: number
  totalWorkMinutes: number
  longestBreakMinutes: number
  allBreaks: Break[]
  hasActiveSession: boolean
  currentBreakMinutes: number
}

interface BreakSummaryProps {
  currentStatus: 'idle' | 'working' | 'break'
}

export const BreakSummary: React.FC<BreakSummaryProps> = ({ currentStatus }) => {
  const { employee } = useAuth()
  const [dayBreakSummary, setDayBreakSummary] = useState<DayBreakSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBreakData = async () => {
    if (!employee) {
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      
      // Get detailed today's attendance records with breaks
      const todayDetailedData = await attendanceAPI.getMyTodayDetailed()
      
      // Also get current session status if any
      const currentResponse = await attendanceAPI.getCurrentAttendanceStatus()
      
      // Process all attendance records for today to get complete break summary
      let totalBreaks = 0
      let totalBreakMinutes = 0
      let totalWorkMinutes = 0
      let longestBreakMinutes = 0
      let allBreaks: Break[] = []
      let hasActiveSession = false
      let currentBreakMinutes = 0
      
      if (todayDetailedData && Array.isArray(todayDetailedData)) {
        // Process all today's sessions
        for (const record of todayDetailedData) {
          if (record.breaks && Array.isArray(record.breaks)) {
            const completedBreaks = record.breaks.filter(b => !b.is_active)
            totalBreaks += completedBreaks.length
            totalBreakMinutes += Math.round((record.total_break_seconds || 0) / 60)
            totalWorkMinutes += Math.round((record.actual_work_seconds || 0) / 60)
            allBreaks = [...allBreaks, ...record.breaks]
            
            // Find longest break
            for (const breakItem of completedBreaks) {
              if (breakItem.duration_minutes && breakItem.duration_minutes > longestBreakMinutes) {
                longestBreakMinutes = breakItem.duration_minutes
              }
            }
          }
        }
      }
      
      // Check for active session
      if (currentResponse.attendance && currentResponse.is_clocked_in) {
        hasActiveSession = true
        currentBreakMinutes = Math.round((currentResponse.attendance.current_break_seconds || 0) / 60)
      }
      
      setDayBreakSummary({
        totalBreaks,
        totalBreakMinutes,
        totalWorkMinutes,
        longestBreakMinutes,
        allBreaks: allBreaks.sort((a, b) => new Date(b.break_start_time).getTime() - new Date(a.break_start_time).getTime()),
        hasActiveSession,
        currentBreakMinutes
      })
      
    } catch (error) {
      console.error('Failed to fetch break data:', error)
      setDayBreakSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBreakData()
  }, [employee, currentStatus])

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const isOnBreak = currentStatus === 'break' && dayBreakSummary?.hasActiveSession

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PauseIcon className="w-5 h-5 mr-2" />
            Break Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dayBreakSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PauseIcon className="w-5 h-5 mr-2" />
            Today's Break Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">No breaks taken today</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PauseIcon className="w-5 h-5 mr-2" />
            Today's Break Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dayBreakSummary.totalBreaks}</div>
              <div className="text-xs text-gray-600">Total Breaks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatDuration(dayBreakSummary.totalBreakMinutes)}</div>
              <div className="text-xs text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatDuration(dayBreakSummary.longestBreakMinutes)}</div>
              <div className="text-xs text-gray-600">Longest Break</div>
            </div>
          </div>

          {/* Current Break Status */}
          {isOnBreak && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-orange-800 font-medium">Currently on break</span>
                </div>
                <span className="text-orange-600 font-mono">
                  {formatDuration(dayBreakSummary.currentBreakMinutes)}
                </span>
              </div>
            </div>
          )}

          {/* Work vs Break Time */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Work Time:</span>
              <span className="font-medium text-green-600">{formatDuration(dayBreakSummary.totalWorkMinutes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Break Time:</span>
              <span className="font-medium text-orange-600">{formatDuration(dayBreakSummary.totalBreakMinutes)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-900">Total Day:</span>
                <span className="text-gray-900">
                  {formatDuration(dayBreakSummary.totalWorkMinutes + dayBreakSummary.totalBreakMinutes)}
                </span>
              </div>
            </div>
          </div>

          {/* Break List */}
          {dayBreakSummary.allBreaks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Today's Breaks</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {dayBreakSummary.allBreaks.map((breakItem) => (
                  <div key={breakItem.break_id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${breakItem.is_active ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-600">
                        {formatTime(breakItem.break_start_time)}
                        {breakItem.break_end_time && ` - ${formatTime(breakItem.break_end_time)}`}
                      </span>
                    </div>
                    <span className="font-medium">
                      {breakItem.is_active ? 'Active' : formatDuration(breakItem.duration_minutes || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
