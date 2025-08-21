'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  CalendarIcon, 
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from './TaskCard'
import { CreateTaskModal, TaskFormData } from './CreateTaskModal'
import { useAuth } from '@/contexts/AuthContext'
import { tasksAPI } from '@/lib/api'
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

interface TaskManagerProps {
  selectedDate?: string
}

export const TaskManager: React.FC<TaskManagerProps> = ({ 
  selectedDate
}) => {
  const { employee } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const targetDate = selectedDate || new Date().toISOString().split('T')[0]
  const isToday = targetDate === new Date().toISOString().split('T')[0]

  const fetchTasks = async () => {
    if (!employee) return

    try {
      setIsLoading(true)
      const data = await tasksAPI.getMyTasks(targetDate)
      setTasks(data || [])

      // Check for active task
      if (isToday) {
        const activeTaskData = await tasksAPI.getActiveTask()
        const active = activeTaskData.has_active_task ? activeTaskData.task : null
        setActiveTask(active)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [employee, targetDate])

  // Real-time updates for active task
  useEffect(() => {
    if (!activeTask || !isToday) return

    const interval = setInterval(async () => {
      try {
        const updatedTask = await tasksAPI.getTaskDetail(activeTask.task_id)
        setActiveTask(updatedTask)
        
        // Update the task in the list as well
        setTasks(prev => prev.map(task => 
          task.task_id === activeTask.task_id ? updatedTask : task
        ))
      } catch (error) {
        console.error('Failed to update active task:', error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTask, isToday])

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      setIsCreating(true)
      const response = await tasksAPI.createTask(data)
      const newTask = response.task
      
      setTasks(prev => [newTask, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartTask = async (taskId: number) => {
    try {
      const response = await tasksAPI.startTask(taskId)
      const updatedTask = response.task
      
      setTasks(prev => prev.map(task => 
        task.task_id === taskId ? updatedTask : task
      ))
      
      setActiveTask(updatedTask)
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const handleStopTask = async (taskId: number) => {
    try {
      const response = await tasksAPI.stopTask(taskId)
      const updatedTask = response.task
      
      setTasks(prev => prev.map(task => 
        task.task_id === taskId ? updatedTask : task
      ))
      
      if (activeTask?.task_id === taskId) {
        setActiveTask(null)
      }
    } catch (error) {
      console.error('Failed to stop task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit modal
    console.log('Edit task:', task)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await tasksAPI.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.task_id !== taskId))
      
      if (activeTask?.task_id === taskId) {
        setActiveTask(null)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    totalTimeSpent: tasks.reduce((acc, task) => acc + task.total_time_spent_seconds, 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Tasks for {formatDate(targetDate)}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your daily tasks and track time spent
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="shrink-0"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 font-mono">
                {formatTime(taskStats.totalTimeSpent)}
              </div>
              <div className="text-xs text-gray-600">Time Spent</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filters:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Active Task Alert */}
      {activeTask && isToday && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-blue-900 font-medium">Currently working on</p>
                <p className="text-blue-700">{activeTask.title}</p>
              </div>
            </div>
            <div className="text-blue-600 font-mono text-lg font-bold">
              {formatTime(activeTask.current_session_duration_seconds)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks for this date</p>
                <p className="text-sm">
                  {isToday ? "Start by creating your first task for today!" : "No tasks were created for this date."}
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onStart={handleStartTask}
                  onStop={handleStopTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
        initialDate={targetDate}
      />
    </div>
  )
}
