export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone_number?: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface JobRole {
  id: number
  name: string
  description: string
  department: Department
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  full_name: string
  address?: string
  phone_number?: string
  role: JobRole
  manager?: {
    id: number
    name: string
    email: string
  }
  expected_hours: number
  is_active: boolean
  date_joined: string
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  attendance_id: number
  employee: number
  employee_name: string
  employee_email: string
  department: string
  date: string
  status: string
  check_in_time: string | null
  check_out_time: string | null
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface APIError {
  message: string
  error?: string
  errors?: Record<string, string[]>
}
