import { useState, useEffect, useCallback } from "react";
import {
  dashboardService,
  DashboardStats,
  WeeklyStats,
  RecentActivity,
} from "@/lib/services/dashboardService";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardDataState {
  data: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseDashboardDataReturn extends DashboardDataState {
  refreshData: () => Promise<void>;
  isLoadingStats: boolean;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const { employee } = useAuth();
  const [state, setState] = useState<DashboardDataState>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!employee?.role?.department?.id) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "No department information available",
      }));
      return;
    }

    try {
      setIsLoadingStats(true);
      setState((prev) => ({ ...prev, error: null }));

      const data = await dashboardService.getDashboardStats(
        employee.role.department.id
      );

      setState({
        data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
      }));
    } finally {
      setIsLoadingStats(false);
    }
  }, [employee?.role?.department?.id]);

  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (employee?.role?.department?.id) {
        fetchDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData, employee?.role?.department?.id]);

  return {
    ...state,
    refreshData,
    isLoadingStats,
  };
};

// Utility hook for specific dashboard sections
export const useWeeklyStats = () => {
  const { data } = useDashboardData();
  return data?.weeklyStats || null;
};

export const useTeamMembersCount = () => {
  const { data } = useDashboardData();
  return data?.teamMembersCount || 0;
};

export const useCurrentStatus = () => {
  const { data } = useDashboardData();
  return data?.currentStatus || { isClockedIn: false, isOnBreak: false };
};

// Hook for recent activities
export const useRecentActivities = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getRecentActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to fetch recent activities:", err);
      setError("Failed to load recent activities");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, isLoading, error, refreshActivities: fetchActivities };
};
