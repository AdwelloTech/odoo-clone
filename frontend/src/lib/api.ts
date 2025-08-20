import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('access_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('access_token')
  }
}

// Initialize token from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token')
  if (token) {
    setAuthToken(token)
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh_token: refreshToken,
          })
          
          const { access } = response.data
          setAuthToken(access)
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/signin/', { email, password })
    return response.data
  },
  
  register: async (userData: any) => {
    const response = await api.post('/api/auth/signup/', userData)
    return response.data
  },
  
  logout: async (refreshToken: string) => {
    const response = await api.post('/api/auth/logout/', { refresh_token: refreshToken })
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/profile/')
    return response.data
  },
}

export const employeeAPI = {
  getCurrentEmployee: async () => {
    const response = await api.get('/api/employees/me/')
    return response.data
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/api/employees/me/update/', data)
    return response.data
  },
  
  getEmployees: async () => {
    const response = await api.get('/api/employees/employees/')
    return response.data
  },
  
  getDepartments: async () => {
    const response = await api.get('/api/employees/departments/')
    return response.data
  },
  
  getJobRoles: async () => {
    const response = await api.get('/api/employees/job-roles/')
    return response.data
  },
}

export const attendanceAPI = {
  createAttendance: async (data: any) => {
    const response = await api.post('/api/attendance/create/', data)
    return response.data
  },
  
  checkIn: async (attendanceId: number) => {
    const response = await api.post(`/api/attendance/${attendanceId}/check-in/`)
    return response.data
  },
  
  checkOut: async (attendanceId: number) => {
    const response = await api.post(`/api/attendance/${attendanceId}/check-out/`)
    return response.data
  },
  
  getTodayAttendance: async () => {
    const response = await api.get('/api/attendance/today/')
    return response.data
  },
  
  getAttendanceByEmployee: async (employeeId: number) => {
    const response = await api.get(`/api/attendance/employee/${employeeId}/`)
    return response.data
  },
  
  getAttendanceByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/api/attendance/date-range/', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },
}
