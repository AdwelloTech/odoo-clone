import api from "@/lib/axios";

export interface EmployeeProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  address?: string;
  manager?: number;
  date_joined: string;
  profile_image?: string;
  role: {
    id: number;
    name: string;
    description?: string;
    department: {
      id: number;
      name: string;
      description?: string;
    };
  };
  expected_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeProfileResponse {
  message: string;
  employee: EmployeeProfile;
}

// Employee API service
export const employeeAPI = {
  // Get current user's employee profile
  async getCurrentUserProfile(): Promise<EmployeeProfile> {
    const response = await api.get<EmployeeProfileResponse>("/employees/me/");
    return response.data.employee;
  },

  // Get employee by ID
  async getEmployee(employeeId: number): Promise<EmployeeProfile> {
    const response = await api.get<EmployeeProfileResponse>(
      `/employees/${employeeId}/`
    );
    return response.data.employee;
  },

  // Get all employees
  async getAllEmployees(): Promise<EmployeeProfile[]> {
    const response = await api.get<EmployeeProfile[]>("/employees/");
    return response.data;
  },
};
