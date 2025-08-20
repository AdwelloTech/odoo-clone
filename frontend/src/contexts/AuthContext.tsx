'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI, employeeAPI, setAuthToken } from '@/lib/api'

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  full_name: string
  role: {
    id: number
    name: string
    department: {
      id: number
      name: string
      description: string
    }
  }
  manager?: {
    id: number
    name: string
    email: string
  }
  expected_hours: number
  is_active: boolean
  date_joined: string
}

interface AuthContextType {
  user: User | null
  employee: Employee | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Get user profile
      const userResponse = await authAPI.getProfile()
      setUser(userResponse)

      // Get employee profile
      try {
        const employeeResponse = await employeeAPI.getCurrentEmployee()
        if (employeeResponse.employee) {
          setEmployee(employeeResponse.employee)
        }
      } catch (employeeError) {
        console.log('No employee profile found')
      }

      setIsAuthenticated(true)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      logout()
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(email, password)
      
      if (response.tokens) {
        // Store tokens
        localStorage.setItem('access_token', response.tokens.access)
        localStorage.setItem('refresh_token', response.tokens.refresh)
        
        // Set auth header
        setAuthToken(response.tokens.access)
        
        // Set user data
        setUser(response.user)
        setIsAuthenticated(true)
        
        // Try to get employee profile
        try {
          const employeeResponse = await employeeAPI.getCurrentEmployee()
          if (employeeResponse.employee) {
            setEmployee(employeeResponse.employee)
          }
        } catch (employeeError) {
          console.log('No employee profile found')
        }
        
        return { success: true }
      }
      
      return { success: false, error: 'Invalid response from server' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    // Clear auth header
    setAuthToken('')
    
    // Clear state
    setUser(null)
    setEmployee(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        setAuthToken(token)
        await refreshUserData()
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    employee,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
