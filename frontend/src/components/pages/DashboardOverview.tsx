'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ClockIcon, 
  UserIcon, 
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  BoltIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'

const quickActions = [
  {
    title: 'Start Time Tracking',
    description: 'Clock in and start tracking your work hours',
    icon: ClockIcon,
    href: '/time-tracking',
    color: 'bg-blue-500',
  },
  {
    title: 'View Profile',
    description: 'Update your personal information and settings',
    icon: UserIcon,
    href: '/profile',
    color: 'bg-green-500',
  },
  {
    title: 'View Reports',
    description: 'Check your attendance reports and analytics',
    icon: ChartBarIcon,
    href: '/reports',
    color: 'bg-purple-500',
  },
  {
    title: 'Calendar View',
    description: 'See your schedule and attendance calendar',
    icon: CalendarDaysIcon,
    href: '/calendar',
    color: 'bg-orange-500',
  },
]

const stats = [
  {
    title: 'Total Hours This Week',
    value: '0h 0m',
    icon: ClockIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Days Worked',
    value: '0',
    icon: CalendarDaysIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Average Daily Hours',
    value: '0h 0m',
    icon: BoltIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Team Members',
    value: '0',
    icon: UsersIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export const DashboardOverview: React.FC = () => {
  const { user, employee } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Today is {formatDate(new Date())}
            </p>
            {employee && (
              <p className="text-blue-200 mt-2">
                {employee.role?.name} • {employee.role?.department?.name}
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <Link href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-gray-600 mb-6">
              Start tracking your time to see your recent activity here.
            </p>
            <Link href="/time-tracking">
              <Button>
                <ClockIcon className="w-4 h-4 mr-2" />
                Start Time Tracking
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
