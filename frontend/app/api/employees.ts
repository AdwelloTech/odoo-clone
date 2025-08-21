import api from "@/lib/axios";

export interface EmployeeProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  email: string;
  address?: string;
  phone_number?: string;
  full_name: string;
  manager?: {
    id: number;
    name: string;
    email: string;
  } | null;
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
  department: {
    id: number;
    name: string;
    description?: string;
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

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  address?: string;
  profile_image?: FormData;
  expected_hours?: number;
}

// Employee API service
export const employeeAPI = {
  // Get current user's employee profile
  async getCurrentUserProfile(): Promise<EmployeeProfile> {
    const response = await api.get<EmployeeProfileResponse>("/employees/me/");
    return response.data.employee;
  },

  // Update current user's employee profile
  async updateCurrentUserProfile(
    data: ProfileUpdateData
  ): Promise<EmployeeProfile> {
    // If profile_image is FormData, use multipart/form-data
    if (data.profile_image instanceof FormData) {
      const response = await api.patch<EmployeeProfileResponse>(
        "/employees/me/update/",
        data.profile_image,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.employee;
    } else {
      // Regular JSON update
      const response = await api.patch<EmployeeProfileResponse>(
        "/employees/me/update/",
        data
      );
      return response.data.employee;
    }
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
