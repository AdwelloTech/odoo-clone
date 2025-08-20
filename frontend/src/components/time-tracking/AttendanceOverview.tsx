'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { DailyActivityChart } from './DailyActivityChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceAPI } from '@/lib/api'

interface AttendanceRecord {
  attendance_id: number
  employee_name: string
  employee_email: string
  department: string
  date: string
  status: string
  check_in_time: string | null
  check_out_time: string | null
}

interface AttendanceOverviewProps {
  currentStatus: 'idle' | 'working' | 'break'
}

export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({ currentStatus }) => {
  const { employee } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch today's attendance for all employees
      const todayData = await attendanceAPI.getTodayAttendance()
      setTodayAttendance(todayData || [])
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [employee])

  const stats = [
    {
      title: "Today's Status",
      value: currentStatus === 'working' ? 'Working' : currentStatus === 'break' ? 'On Break' : 'Not Working',
      icon: ClockIcon,
      color: currentStatus === 'working' ? 'text-green-600' : currentStatus === 'break' ? 'text-orange-600' : 'text-gray-600',
    },
    {
      title: 'Team Online',
      value: todayAttendance.filter(a => a.check_in_time && !a.check_out_time).length,
      icon: UserGroupIcon,
      color: 'text-blue-600',
    },
    {
      title: 'Total Today',
      value: todayAttendance.length,
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Team Activity */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Today's Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : todayAttendance.length > 0 ? (
            <div className="space-y-3">
              {todayAttendance.map((record) => (
                <div key={record.attendance_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIndicator(record.status, record.check_in_time, record.check_out_time)}
                    <div>
                      <p className="font-medium text-gray-900">{record.employee_name}</p>
                      <p className="text-sm text-gray-600">{record.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {calculateWorkingHours(record.check_in_time, record.check_out_time)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {record.check_in_time ? formatTimeOnly(new Date(record.check_in_time)) : 'Not clocked in'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No attendance records for today</p>
          )}
        </CardContent>
      </Card> */}

      {/* Daily Activity Chart */}
      <DailyActivityChart currentStatus={currentStatus} />
    </div>
  )
}
