import { api } from "../api";

export interface WeeklyStats {
  totalHours: number;
  totalMinutes: number;
  daysWorked: number;
  averageDailyHours: number;
  averageDailyMinutes: number;
}

export interface DashboardStats {
  weeklyStats: WeeklyStats;
  teamMembersCount: number;
  currentStatus: {
    isClockedIn: boolean;
    isOnBreak: boolean;
    currentSession?: any;
  };
}

export interface AttendanceRecord {
  attendance_id: number;
  employee: number;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  department?: string;
}

export interface RecentActivity {
  type: "check_in" | "check_out" | "break_start" | "break_end";
  timestamp: string;
  description: string;
  attendance: AttendanceRecord;
}

export interface EmployeeRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
    };
  };
  is_active: boolean;
}

class DashboardService {
  private readonly BASE_URL = "/api";

  /**
   * Get current week's date range (Monday to Sunday)
   */
  private getCurrentWeekRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so offset by 6

    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
    };
  }

  /**
   * Calculate duration between two timestamps in minutes
   */
  private calculateDurationMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Convert minutes to hours and minutes format
   */
  private minutesToHoursMinutes(totalMinutes: number): {
    hours: number;
    minutes: number;
  } {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }

  /**
   * Get weekly attendance statistics
   */
  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      const { startDate, endDate } = this.getCurrentWeekRange();

      const response = await api.get(
        `${this.BASE_URL}/attendance/date-range/`,
        {
          params: { start_date: startDate, end_date: endDate },
        }
      );

      const attendances: AttendanceRecord[] = response.data;

      let totalMinutes = 0;
      const uniqueDates = new Set<string>();

      attendances.forEach((attendance) => {
        if (attendance.check_in_time && attendance.check_out_time) {
          const duration = this.calculateDurationMinutes(
            attendance.check_in_time,
            attendance.check_out_time
          );
          totalMinutes += duration;
          uniqueDates.add(attendance.date);
        }
      });

      const daysWorked = uniqueDates.size;
      const averageDailyMinutes =
        daysWorked > 0 ? Math.round(totalMinutes / daysWorked) : 0;

      const { hours: totalHours, minutes: totalMinutesRemainder } =
        this.minutesToHoursMinutes(totalMinutes);
      const { hours: avgHours, minutes: avgMinutes } =
        this.minutesToHoursMinutes(averageDailyMinutes);

      return {
        totalHours,
        totalMinutes: totalMinutesRemainder,
        daysWorked,
        averageDailyHours: avgHours,
        averageDailyMinutes: avgMinutes,
      };
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      return {
        totalHours: 0,
        totalMinutes: 0,
        daysWorked: 0,
        averageDailyHours: 0,
        averageDailyMinutes: 0,
      };
    }
  }

  /**
   * Get team members count (employees in same department)
   */
  async getTeamMembersCount(departmentId: number): Promise<number> {
    try {
      const response = await api.get(
        `${this.BASE_URL}/employees/employees/active/`
      );
      const employees: EmployeeRecord[] = response.data;

      const teamMembers = employees.filter(
        (employee) =>
          employee.role.department.id === departmentId && employee.is_active
      );

      return teamMembers.length;
    } catch (error) {
      console.error("Error fetching team members count:", error);
      return 0;
    }
  }

  /**
   * Get current attendance status
   */
  async getCurrentStatus(): Promise<{
    isClockedIn: boolean;
    isOnBreak: boolean;
    currentSession?: any;
  }> {
    try {
      const response = await api.get(
        `${this.BASE_URL}/attendance/current-status/`
      );
      return {
        isClockedIn: response.data.is_clocked_in,
        isOnBreak: response.data.is_on_break || false,
        currentSession: response.data.attendance || null,
      };
    } catch (error) {
      console.error("Error fetching current status:", error);
      return {
        isClockedIn: false,
        isOnBreak: false,
      };
    }
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(departmentId: number): Promise<DashboardStats> {
    try {
      const [weeklyStats, teamMembersCount, currentStatus] = await Promise.all([
        this.getWeeklyStats(),
        this.getTeamMembersCount(departmentId),
        this.getCurrentStatus(),
      ]);

      return {
        weeklyStats,
        teamMembersCount,
        currentStatus,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  /**
   * Get recent attendance activities (last 5 activities)
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      // Get last 7 days of attendance data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const response = await api.get(
        `${this.BASE_URL}/attendance/date-range/`,
        {
          params: {
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          },
        }
      );

      const attendances: AttendanceRecord[] = response.data;
      const activities: RecentActivity[] = [];

      // Process each attendance record to extract activities
      attendances.forEach((attendance) => {
        if (attendance.check_in_time) {
          activities.push({
            type: "check_in",
            timestamp: attendance.check_in_time,
            description: `Clocked in at ${new Date(
              attendance.check_in_time
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            attendance,
          });
        }

        if (attendance.check_out_time) {
          activities.push({
            type: "check_out",
            timestamp: attendance.check_out_time,
            description: `Clocked out at ${new Date(
              attendance.check_out_time
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            attendance,
          });
        }
      });

      // Sort by timestamp (most recent first) and return last 5
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboardData(departmentId: number): Promise<DashboardStats> {
    return this.getDashboardStats(departmentId);
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
