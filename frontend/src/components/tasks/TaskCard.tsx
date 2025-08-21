'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

interface Task {
  task_id: number
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  task_date: string
  estimated_duration_minutes?: number
  total_time_spent_seconds: number
  is_active: boolean
  current_session_duration_seconds: number
}

interface TaskCardProps {
  task: Task
  onStart: (taskId: number) => void
  onStop: (taskId: number) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  isLoading?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onStop,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'in_progress':
        return <ClockIcon className="w-4 h-4" />
      case 'cancelled':
        return <XMarkIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'urgent':
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return null
    }
  }

  const currentTime = task.is_active 
    ? task.current_session_duration_seconds 
    : task.total_time_spent_seconds

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`relative ${task.is_active ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
    >
      <Card className={`hover:shadow-md transition-all duration-200 ${task.is_active ? 'bg-blue-50/30' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-3">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task.task_id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
              {getPriorityIcon()}
              <span className="ml-1 capitalize">{task.priority}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </span>
          </div>

          {/* Time tracking */}
          <div className="space-y-3">
            {/* Current timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className={`w-5 h-5 ${task.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {task.is_active ? 'Current Session' : 'Total Time'}
                </span>
              </div>
              <div className={`font-mono text-lg font-bold ${task.is_active ? 'text-blue-600' : 'text-gray-900'}`}>
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Total time (if currently active) */}
            {task.is_active && task.total_time_spent_seconds > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Time</span>
                <span className="font-mono text-gray-700">
                  {formatTime(task.total_time_spent_seconds)}
                </span>
              </div>
            )}

            {/* Estimated vs actual */}
            {task.estimated_duration_minutes && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated</span>
                <span className="font-mono text-gray-700">
                  {formatTime(task.estimated_duration_minutes * 60)}
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-4">
            {task.status === 'completed' ? (
              <Button
                disabled
                size="lg"
                className="w-full bg-green-100 text-green-700 cursor-not-allowed"
                variant="outline"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Completed
              </Button>
            ) : task.is_active ? (
              <Button
                onClick={() => onStop(task.task_id)}
                disabled={isLoading}
                size="lg"
                className="w-full"
                variant="destructive"
              >
                <PauseIcon className="w-5 h-5 mr-2" />
                {isLoading ? 'Stopping...' : 'Stop Task'}
              </Button>
            ) : (
              <Button
                onClick={() => onStart(task.task_id)}
                disabled={isLoading}
                size="lg"
                className="w-full"
                variant="success"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                {isLoading ? 'Starting...' : 'Start Task'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
