import api from "@/lib/axios";

export interface AttendanceRecord {
  attendance_id: number;
  employee: number;
  employee_name: string;
  employee_email: string;
  department: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendanceData {
  employee: number;
  date: string;
  status: string;
}

export interface UpdateAttendanceData {
  status?: string;
  check_in_time?: string;
  check_out_time?: string;
}

export interface AttendanceStats {
  totalHours: number;
  breakHours: number;
  isOvertime: boolean;
  isShortHours: boolean;
}

// Attendance API service
export const attendanceAPI = {
  // Create new attendance record
  async createAttendance(
    data: CreateAttendanceData
  ): Promise<AttendanceRecord> {
    const response = await api.post("/attendance/create/", data);
    return response.data.attendance;
  },

  // Get attendance by ID
  async getAttendance(attendanceId: number): Promise<AttendanceRecord> {
    const response = await api.get(`/attendance/${attendanceId}/`);
    return response.data;
  },

  // Update attendance record
  async updateAttendance(
    attendanceId: number,
    data: UpdateAttendanceData
  ): Promise<AttendanceRecord> {
    const response = await api.patch(`/attendance/${attendanceId}/`, data);
    return response.data.attendance;
  },

  // Check in
  async checkIn(attendanceId: number): Promise<AttendanceRecord> {
    const response = await api.post(`/attendance/${attendanceId}/check-in/`);
    return response.data.attendance;
  },

  // Check out
  async checkOut(attendanceId: number): Promise<AttendanceRecord> {
    const response = await api.post(`/attendance/${attendanceId}/check-out/`);
    return response.data.attendance;
  },

  // Get today's attendance
  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    const response = await api.get("/attendance/today/");
    return response.data;
  },

  // Get attendance by date range
  async getAttendanceByDateRange(
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    const response = await api.get("/attendance/date-range/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Get attendance by employee
  async getAttendanceByEmployee(
    employeeId: number
  ): Promise<AttendanceRecord[]> {
    const response = await api.get(`/attendance/employee/${employeeId}/`);
    return response.data;
  },

  // Get or create today's attendance record
  async getOrCreateTodayAttendance(
    employeeId: number
  ): Promise<AttendanceRecord> {
    try {
      // First try to get today's attendance
      const todayAttendances = await this.getTodayAttendance();
      const todayAttendance = todayAttendances.find(
        (att) => att.employee === employeeId
      );

      if (todayAttendance) {
        return todayAttendance;
      }

      // If no attendance record exists, create one
      const today = new Date().toISOString().split("T")[0];
      const newAttendance = await this.createAttendance({
        employee: employeeId,
        date: today,
        status: "Checked In",
      });

      return newAttendance;
    } catch (error) {
      console.error("Error getting/creating today's attendance:", error);
      throw error;
    }
  },
};

// Utility functions for time calculations
export const calculateWorkHours = (
  checkInTime: string,
  checkOutTime: string | null
): number => {
  if (!checkOutTime) return 0;

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffMs = checkOut.getTime() - checkIn.getTime();

  return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
};

export const calculateBreakHours = (activities: any[]): number => {
  let totalBreakTime = 0;
  let breakStartTime: Date | null = null;

  for (const activity of activities) {
    if (activity.type === "break") {
      breakStartTime = new Date(activity.timestamp);
    } else if (activity.type === "breakend" && breakStartTime) {
      const breakEndTime = new Date(activity.timestamp);
      const breakDuration =
        (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60);
      totalBreakTime += breakDuration;
      breakStartTime = null;
    }
  }

  return totalBreakTime;
};

export const isOvertime = (totalHours: number): boolean => {
  return totalHours > 8;
};

export const isShortHours = (totalHours: number): boolean => {
  return totalHours < 8;
};
