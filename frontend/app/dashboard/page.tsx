"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardBody, Button } from "@heroui/react";
import {
  Clock,
  Play,
  Pause,
  Coffee,
  LogOut,
  User,
  BarChart3,
  HamburgerIcon,
  Menu,
  LogIn,
  Calendar,
  RefreshCw,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { attendanceAPI, AttendanceRecord } from "@/app/api/attendance";

import { employeeAPI, EmployeeProfile } from "@/app/api/employees";
import AppNavbar from "@/components/navbar";

// Types
interface Activity {
  type: "checkin" | "checkout" | "break_start" | "break_end";
  description: string;
  time: string;
  timestamp: Date;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;

  color?: "primary" | "success" | "warning" | "danger" | "default";
}

interface HeaderProps {
  currentTime: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface ActionButtonsProps {
  isOnBreak: boolean;
  isCheckedIn: boolean;
  isLoading: boolean;
  isInWorkSession: boolean;
  onCheckIn: () => void;
  onBreak: () => void;
  onAttendance: () => void;
  onLogout?: () => void;
  extraContent: React.ReactNode;
  disabled?: boolean;
}

interface ActivityTableProps {
  activities: Activity[];
}

// Custom hooks
const useTimer = (isActive: boolean) => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const reset = useCallback(() => {
    setSeconds(0);
  }, []);

  return { seconds, reset };
};

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

// Utility functions
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

const formatTimeShort = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  return `${m}m`;
};

const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,

  color = "default",
}) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-[#3D3D3D] shadow-xs shadow-[#FF6300]",
    success: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    warning: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20",
    danger: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
    default: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20",
  };

  return (
    <Card
      className={`${colorClasses[color]} backdrop-blur-sm border transition-all duration-200`}
    >
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#CCCCCC] font-semibold">{title}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-gray-400">{subtitle}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOnBreak,
  isCheckedIn,
  isLoading,
  isInWorkSession,
  onCheckIn,
  onBreak,
  onAttendance,
  extraContent,
  disabled,
}) => {
  const currentTIme = useCurrentTime();

  return (
    <section>
      <div className="gap-4 absolute">
        <div className="flex items-center gap-2 text-white">
          <Clock size={28} />
          <div className="flex flex-col">
            <time className="text-2xl leading-tight font-bold">
              {currentTIme}
            </time>
            <span className="text-sm font-semibold text-[#C23933]">
              {getCurrentDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end mb-8">
        <Button
          size="lg"
          color={isCheckedIn ? "danger" : "success"}
          startContent={isCheckedIn ? <LogOut size={20} /> : <Play size={20} />}
          onClick={onCheckIn}
          disabled={isLoading || disabled}
          className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Syncing..." : isCheckedIn ? "Check Out" : "Check In"}
        </Button>

        <div className="flex gap-3">
          {/*<Button
            size="lg"
            color={isOnBreak ? "success" : "warning"}
            startContent={isOnBreak ? <Play size={20} /> : <Coffee size={20} />}
            onClick={onBreak}
            disabled={!isCheckedIn || isLoading || disabled}
            className={`font-semibold text-xl ${
              !isCheckedIn || isLoading || disabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600"
            }`}
          >
            {isOnBreak ? "End Break" : "Break"}
          </Button> */}

          <Button
            size="lg"
            color="primary"
            startContent={<Calendar size={20} />}
            onClick={onAttendance}
            className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
          >
            Attendance
          </Button>
        </div>
      </div>
    </section>
  );
};

// Activity Table Component
const ActivityTable: React.FC<ActivityTableProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity["type"]) => {
    const iconProps = { size: 16 };

    switch (type) {
      case "checkin":
        return <LogIn {...iconProps} className="text-[#FF6300]" />;
      case "checkout":
        return <LogOut {...iconProps} className="text-[#FF6300]" />;
      case "break_start":
        return <Coffee {...iconProps} className="text-[#FF6300]" />;
      case "break_end":
        return <Play {...iconProps} className="text-[#FF6300]" />;
      default:
        return <Clock {...iconProps} className="text-[#FF6300]" />;
    }
  };

  const getActivityLabel = (type: Activity["type"]): string => {
    switch (type) {
      case "checkin":
        return "Checked In";
      case "checkout":
        return "Checked Out";
      case "break_start":
        return "Break Started";
      case "break_end":
        return "Break Ended";
      default:
        return "Activity";
    }
  };

  return (
    <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
      <CardBody className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-white" />
          <h3 className="text-lg font-semibold text-white">Today's Activity</h3>
        </div>

        <div className="space-y-3 max-h-100 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock size={48} className="mx-auto mb-2 text-gray-600" />
              <p>No activities recorded today</p>
              <p className="text-sm text-gray-500 mt-1">
                Check in to start tracking your day
              </p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={`${activity.timestamp.getTime()}-${index}`}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-700/30 transition-colors border-b border-gray-700/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1">{getActivityIcon(activity.type)}</div>
                  <div>
                    <span className="text-white font-medium block">
                      {getActivityLabel(activity.type)}
                    </span>
                    {activity.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.description}
                      </div>
                    )}
                  </div>
                </div>
                <time className="text-sm text-gray-300 font-mono">
                  {activity.time}
                </time>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Main Dashboard Component
const TimeTrackingDashboard: React.FC = () => {
  const currentTime = useCurrentTime();
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentAttendance, setCurrentAttendance] =
    useState<AttendanceRecord | null>(null);
  const [todayAttendances, setTodayAttendances] = useState<AttendanceRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is currently in a work session
  const isInWorkSession = Boolean(
    currentAttendance &&
      currentAttendance.check_in_time &&
      !currentAttendance.check_out_time
  );
  const { user } = useAuth();
  const [employeeProfile, setEmployeeProfile] =
    useState<EmployeeProfile | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  // Fetch current user's employee profile
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user) return;

      try {
        const profile = await employeeAPI.getCurrentUserProfile();
        setEmployeeProfile(profile);
        setEmployeeId(profile.id);
        setError(null);
      } catch (error) {
        console.error("Error fetching employee profile:", error);
        setError(
          "Employee profile not found. Please contact your administrator."
        );
        setEmployeeId(null);
      }
    };

    fetchEmployeeProfile();
  }, [user]);

  // Load initial attendance state from backend (only once when component mounts)
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have a valid employee ID
        if (!employeeId) {
          setError(
            "Employee profile not found. Please contact your administrator."
          );
          setIsLoading(false);
          return;
        }

        // Only fetch from backend on initial load
        const today = new Date().toISOString().split("T")[0];
        const todayAttendances = await attendanceAPI.getTodayAttendance();

        // Store today's attendance records
        setTodayAttendances(todayAttendances);

        // Find the most recent active session for this employee
        const activeSession = todayAttendances.find(
          (att) =>
            att.employee === employeeId &&
            att.check_in_time &&
            !att.check_out_time
        );

        if (activeSession) {
          // Restore the active session from backend
          setCurrentAttendance(activeSession);
          setIsCheckedIn(true);
          setCheckInTime(new Date(activeSession.check_in_time!));

          console.log("Found active session from backend:", activeSession);
        } else {
          // No active session, start fresh
          setIsCheckedIn(false);
          setCheckInTime(null);
          setCurrentAttendance(null);
        }
      } catch (error) {
        console.error("Error loading initial state:", error);
        setError("Failed to load attendance data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      loadInitialState();
    }
  }, [employeeId]);

  // Remove the 30-second sync interval since we don't need constant backend queries
  // The state is managed locally and only synced when actions occur

  // Timer logic
  const workTimer = useTimer(isCheckedIn && !isOnBreak);
  const breakTimer = useTimer(isOnBreak);

  const expectedSeconds: number = 8 * 3600; // 8 hours in seconds
  const remainingSeconds: number = Math.max(
    0,
    expectedSeconds - workTimer.seconds
  );

  const addActivity = useCallback(
    (type: Activity["type"], description: string = "") => {
      const now = new Date();
      const newActivity: Activity = {
        type,
        description,
        time: getCurrentTimeString(),
        timestamp: now,
      };

      setActivities((prev) => [newActivity, ...prev]);
    },
    []
  );

  // Restore activities when we have a restored session
  useEffect(() => {
    if (
      isCheckedIn &&
      checkInTime &&
      currentAttendance &&
      activities.length === 0
    ) {
      // We have a restored session but no activities, add the check-in activity
      addActivity("checkin", "Resumed work session");
    }
  }, [
    isCheckedIn,
    checkInTime,
    currentAttendance,
    activities.length,
    addActivity,
  ]);

  // Calculate actual hours from activities
  const calculateHoursFromActivities = useCallback(() => {
    if (activities.length === 0) return { totalHours: 0, breakHours: 0 };

    const checkInActivity = activities.find((a) => a.type === "checkin");
    const checkOutActivity = activities.find((a) => a.type === "checkout");

    if (!checkInActivity) return { totalHours: 0, breakHours: 0 };

    const checkInTime = checkInActivity.timestamp;
    const checkOutTime = checkOutActivity
      ? checkOutActivity.timestamp
      : new Date();

    // Calculate total hours worked
    const totalMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);

    // Calculate break hours
    let breakMs = 0;
    let breakStartTime: Date | null = null;

    for (const activity of activities) {
      if (activity.type === "break_start") {
        breakStartTime = activity.timestamp;
      } else if (activity.type === "break_end" && breakStartTime) {
        breakMs += activity.timestamp.getTime() - breakStartTime.getTime();
        breakStartTime = null;
      }
    }

    // If break is still ongoing, add current break time
    if (breakStartTime) {
      breakMs += new Date().getTime() - breakStartTime.getTime();
    }

    const breakHours = breakMs / (1000 * 60 * 60);

    return { totalHours: Math.max(0, totalHours - breakHours), breakHours };
  }, [activities]);

  const handleCheckIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always ensure we have a valid employee ID
      if (!employeeId) {
        setError(
          "Employee profile not found. Please contact your administrator."
        );
        return;
      }

      if (isCheckedIn) {
        // User is checking out (for break or end of day)
        if (currentAttendance) {
          // Update backend
          console.log(
            "Attempting to check out with attendance ID:",
            currentAttendance.attendance_id
          );
          console.log("Current attendance object:", currentAttendance);

          if (!currentAttendance.attendance_id) {
            throw new Error(
              "Attendance ID is missing from current attendance record"
            );
          }

          await attendanceAPI.checkOut(currentAttendance.attendance_id);

          // Update local state
          setIsCheckedIn(false);
          setIsOnBreak(false);
          setCheckInTime(null);
          addActivity("checkout", "Ended work session");
          workTimer.reset();
          breakTimer.reset();

          // Notify other tabs about the attendance change
          localStorage.setItem("attendance_updated", Date.now().toString());

          // Update current attendance
          setCurrentAttendance((prev) =>
            prev
              ? {
                  ...prev,
                  check_out_time: new Date().toISOString(),
                  status: "Checked Out",
                }
              : null
          );

          // Update today's attendances to reflect the checkout
          setTodayAttendances((prev) =>
            prev.map((att) =>
              att.attendance_id === currentAttendance.attendance_id
                ? {
                    ...att,
                    check_out_time: new Date().toISOString(),
                    status: "Checked Out",
                  }
                : att
            )
          );
        }
      } else {
        // User is checking in (starting work or resuming from break)
        // Create a new attendance record for this session
        const today = new Date().toISOString().split("T")[0];

        console.log("Creating new attendance record for new session");

        try {
          // Create new attendance record for this session
          const newAttendance = await attendanceAPI.createAttendance({
            employee: employeeId,
            date: today,
            status: "Checked In",
          });

          setCurrentAttendance(newAttendance);

          // Add to today's attendances
          setTodayAttendances((prev) => [...prev, newAttendance]);

          // Now check in to the new record
          await attendanceAPI.checkIn(newAttendance.attendance_id);

          // Update local state
          setIsCheckedIn(true);
          setCheckInTime(new Date());
          addActivity("checkin", "Started work session");

          // Update current attendance
          setCurrentAttendance((prev) =>
            prev
              ? {
                  ...prev,
                  check_in_time: new Date().toISOString(),
                  status: "Checked In",
                }
              : null
          );

          // Notify other tabs about the attendance change
          localStorage.setItem("attendance_updated", Date.now().toString());
        } catch (createError: any) {
          console.error("Error creating new attendance record:", createError);
          throw createError;
        }
      }
    } catch (error) {
      console.error("Error updating attendance:", error);

      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      // Log axios error details if available
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response headers:", axiosError.response?.headers);
      }

      // Show more specific error message
      let errorMessage = "Failed to update attendance. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Attendance ID is missing")) {
          errorMessage =
            "Attendance record is corrupted. Please refresh the page.";
        } else if (error.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("already exists")) {
          errorMessage =
            "Attendance record already exists. Please refresh the page.";
        }
      }

      // Check for specific HTTP status codes
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 500) {
          errorMessage =
            "Server error. Please check if the backend is running properly.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Resource not found. Please refresh the page.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Access denied. Please check your permissions.";
        }
      }

      setError(errorMessage);

      // Fallback to local state only
      if (isCheckedIn) {
        setIsCheckedIn(false);
        setIsOnBreak(false);
        setCheckInTime(null);
        addActivity("checkout", "Ended work session");
        workTimer.reset();
        breakTimer.reset();
      } else {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
        addActivity("checkin", "Started work session");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isCheckedIn,
    currentAttendance,
    addActivity,
    workTimer,
    breakTimer,
    employeeId,
  ]);

  const handleBreak = useCallback(() => {
    if (isOnBreak) {
      setIsOnBreak(false);
      addActivity("break_end", "Resumed work");
    } else {
      setIsOnBreak(true);
      addActivity("break_start", "Taking a break");
    }
  }, [isOnBreak, addActivity]);

  // Remove handleCheckOut since it's now handled in handleCheckIn

  const handleAttendance = useCallback(() => {
    router.push("/attendance");
  }, [router]);

  // Helper function to check if user has worked today
  const hasWorkedToday = useCallback(() => {
    return todayAttendances.length > 0;
  }, [todayAttendances]);

  // Helper function to calculate total hours worked today
  const getTotalHoursWorkedToday = useCallback(() => {
    if (todayAttendances.length === 0) return 0;

    let totalHours = 0;

    // Add hours from completed sessions
    todayAttendances.forEach((attendance) => {
      if (attendance.check_in_time && attendance.check_out_time) {
        const checkIn = new Date(attendance.check_in_time);
        const checkOut = new Date(attendance.check_out_time);
        const duration = checkOut.getTime() - checkIn.getTime();
        totalHours += duration / (1000 * 60 * 60);
      }
    });

    // Add hours from current active session if user is checked in
    if (isCheckedIn && checkInTime) {
      const currentSessionHours =
        (new Date().getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      totalHours += currentSessionHours;
    }

    return totalHours;
  }, [todayAttendances, isCheckedIn, checkInTime]);

  // Helper function to calculate remaining hours to reach daily goal
  const getRemainingHours = useCallback(() => {
    const totalWorked = getTotalHoursWorkedToday();
    const expectedHours = 8; // 8 hours daily goal
    return Math.max(0, expectedHours - totalWorked);
  }, [getTotalHoursWorkedToday]);

  // Debug logging for empty state logic
  useEffect(() => {
    if (activities.length === 0) {
      console.log("Empty state debug:", {
        activitiesLength: activities.length,
        hasWorkedToday: hasWorkedToday(),
        todayAttendancesLength: todayAttendances.length,
        totalHoursWorkedToday: getTotalHoursWorkedToday(),
        isCheckedIn,
        currentAttendance: !!currentAttendance,
      });
    }
  }, [
    activities.length,
    hasWorkedToday,
    todayAttendances.length,
    getTotalHoursWorkedToday,
    isCheckedIn,
    currentAttendance,
  ]);

  // Function to refresh attendance state from backend (useful when returning from other pages)
  const refreshAttendanceState = useCallback(async () => {
    if (!employeeId) return;

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0];
      const todayAttendances = await attendanceAPI.getTodayAttendance();

      // Update today's attendances
      setTodayAttendances(todayAttendances);

      const activeSession = todayAttendances.find(
        (att) =>
          att.employee === employeeId &&
          att.check_in_time &&
          !att.check_out_time
      );

      if (activeSession) {
        // Only update state if it's different from current state
        if (
          !currentAttendance ||
          currentAttendance.attendance_id !== activeSession.attendance_id ||
          currentAttendance.check_in_time !== activeSession.check_in_time
        ) {
          setCurrentAttendance(activeSession);
          setIsCheckedIn(true);
          setCheckInTime(new Date(activeSession.check_in_time!));
          console.log("Refreshed active session from backend:", activeSession);
        } else {
          console.log(
            "Current session is already up to date, no state change needed"
          );
        }
      } else {
        // Only reset state if we currently have an active session
        if (isCheckedIn || currentAttendance) {
          setIsCheckedIn(false);
          setCheckInTime(null);
          setCurrentAttendance(null);
          console.log("No active session found, state reset");
        } else {
          console.log("Already in correct state (not checked in)");
        }
      }
    } catch (error) {
      console.error("Error refreshing attendance state:", error);
      setError("Failed to refresh attendance data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentAttendance, isCheckedIn]);

  // Function to manually invalidate cache and force refresh
  const invalidateCache = useCallback(() => {
    console.log("Manually invalidating cache...");
    setCurrentAttendance(null);
    setIsCheckedIn(false);
    setCheckInTime(null);
    // Trigger a refresh
    setTimeout(() => {
      if (employeeId) {
        refreshAttendanceState();
      }
    }, 100);
  }, [employeeId, refreshAttendanceState]);

  // Validate and fix inconsistent states
  useEffect(() => {
    if (currentAttendance && isCheckedIn && !checkInTime) {
      console.warn(
        "Inconsistent state detected: attendance exists but no check-in time"
      );
      // Fix the inconsistent state
      if (currentAttendance.check_in_time) {
        setCheckInTime(new Date(currentAttendance.check_in_time));
      } else {
        // If no check-in time in attendance record, reset state
        setIsCheckedIn(false);
        setCurrentAttendance(null);
      }
    }

    if (isCheckedIn && !currentAttendance) {
      console.warn(
        "Inconsistent state detected: checked in but no attendance record"
      );
      // Reset to consistent state
      setIsCheckedIn(false);
      setCheckInTime(null);
    }
  }, [currentAttendance, isCheckedIn, checkInTime]);

  // Cache invalidation: Only refresh when we know there might be changes
  // This replaces the tab focus refresh with a more intelligent approach
  useEffect(() => {
    // Set up a cache invalidation mechanism
    const invalidateCache = () => {
      // This will be called when we know the cache might be stale
      console.log("Cache invalidated, will refresh on next need");
    };

    // Listen for storage events (if another tab makes changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "attendance_updated" && e.newValue) {
        console.log("Attendance updated in another tab, invalidating cache");
        // Clear current state to force refresh on next operation
        setCurrentAttendance(null);
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    };

    // Listen for visibility changes (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && employeeId) {
        // Only refresh if we don't have valid cached data
        if (!currentAttendance || !checkInTime) {
          console.log("Tab became visible and no cached data, refreshing...");
          refreshAttendanceState();
        } else {
          console.log(
            "Tab became visible with valid cached data, no refresh needed"
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [employeeId, currentAttendance, checkInTime, refreshAttendanceState]);

  return (
    <ProtectedRoute>
      <div className="relative bg-[#111111] min-h-screen ">
        <Image
          alt="bg"
          src="/bg-img.png"
          className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
          height={1080}
          width={1080}
        />

        <div className="relative z-10">
          <header className="px-8 justify-between flex flex-row mb-8">
            <div className="w-24 h-28 pt-8 text-white font-bold cursor-pointer">
              <AppNavbar />
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<RefreshCw size={16} />}
                onPress={invalidateCache}
                disabled={isLoading}
                className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30"
              >
                {isLoading ? "Syncing..." : "Refresh"}
              </Button>
              <Image
                src={"/logo.png"}
                width={160}
                height={160}
                alt="adwellow"
              />
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Employee Profile Not Found Message */}
            {!employeeId && !error && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  Employee profile not found. Please contact your administrator
                  to set up your employee profile.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">Syncing with server...</p>
              </div>
            )}

            <ActionButtons
              extraContent
              isOnBreak={isOnBreak}
              isCheckedIn={isCheckedIn}
              isLoading={isLoading}
              isInWorkSession={isInWorkSession}
              onCheckIn={handleCheckIn}
              onBreak={handleBreak}
              onAttendance={handleAttendance}
              disabled={!employeeId}
            />

            {/* Stats Cards - Show if there are activities today OR if user has worked today */}
            {(activities.length > 0 || hasWorkedToday()) && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Worked Hours"
                  value={`${getTotalHoursWorkedToday().toFixed(1)}h`}
                  subtitle="Today"
                  color={
                    getTotalHoursWorkedToday() >= 8 ? "success" : "primary"
                  }
                />
                <StatsCard
                  title="Expected Hours"
                  value={formatTime(expectedSeconds)}
                  subtitle="Target for today"
                  color="primary"
                />
                {/*<StatsCard
                  title="Break Hours"
                  value={`${calculateHoursFromActivities().breakHours.toFixed(1)}h`}
                  subtitle="Total Breaks"
                  color="primary"
                /> */}
                <StatsCard
                  title="Remaining Hours"
                  value={formatTime(getRemainingHours() * 3600)}
                  subtitle="To reach target"
                  color={getRemainingHours() === 0 ? "success" : "primary"}
                />
              </section>
            )}

            {/* Daily Progress Bar - Show if user has worked today */}
            {hasWorkedToday() && (
              <section className="mb-8">
                <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Daily Progress
                      </h3>
                      <span className="text-sm text-gray-400">
                        {getTotalHoursWorkedToday().toFixed(1)}h / 8h
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          getTotalHoursWorkedToday() >= 8
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-[#FF6300] to-[#C23732]"
                        }`}
                        style={{
                          width: `${Math.min(100, (getTotalHoursWorkedToday() / 8) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {getTotalHoursWorkedToday() >= 8 ? (
                        <span className="text-green-400">
                          🎉 Daily goal achieved!
                        </span>
                      ) : (
                        <span>
                          {getRemainingHours().toFixed(1)} hours remaining to
                          reach your daily goal
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </section>
            )}

            {/* Current Session Status */}
            {isInWorkSession && (
              <section className="mb-8">
                <Card className="bg-green-500/10 border-green-500/20 backdrop-blur-sm">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Play size={24} className="text-green-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Active Work Session
                          </h3>
                          <p className="text-green-400 text-sm">
                            Started at{" "}
                            {checkInTime?.toLocaleTimeString("en-US", {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatTime(workTimer.seconds)}
                        </div>
                        <div className="text-green-400 text-sm">
                          Current Session
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </section>
            )}

            {/* Activity Table - Always visible if there are activities */}
            {activities.length > 0 && (
              <section>
                <ActivityTable activities={activities} />
              </section>
            )}

            {/* Empty State - Show when no activities */}
            {activities.length === 0 && (
              <section className="text-center py-16">
                <div className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50 rounded-lg p-8 max-w-md mx-auto">
                  {hasWorkedToday() ? (
                    // User has worked today but no current activities
                    <>
                      <Clock size={64} className="mx-auto mb-4 text-gray-500" />
                      {getTotalHoursWorkedToday() >= 8 ? (
                        // User has met their daily goal
                        <>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Great Work Today! 🎉
                          </h3>
                          <p className="text-gray-400 mb-4">
                            You've completed your daily goal of 8 hours. You can
                            check in again for overtime work if needed.
                          </p>
                        </>
                      ) : (
                        // User hasn't met their daily goal yet
                        <>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Ready for Your Next Session?
                          </h3>
                          <p className="text-gray-400 mb-4">
                            You've worked{" "}
                            {getTotalHoursWorkedToday().toFixed(1)} hours today.
                            {getRemainingHours() > 0 ? (
                              <>
                                {" "}
                                Click "Check In" to continue working towards
                                your daily goal. (
                                {getRemainingHours().toFixed(1)} hours
                                remaining)
                              </>
                            ) : (
                              <>
                                {" "}
                                Great job! You've exceeded your daily goal. You
                                can check in for overtime work.
                              </>
                            )}
                          </p>
                        </>
                      )}
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          💡 You can check in multiple times per day for breaks
                          and different work sessions.
                        </p>
                      </div>
                    </>
                  ) : (
                    // User hasn't worked today at all
                    <>
                      <Clock size={64} className="mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Ready to Start Your Day?
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Click "Check In" to begin tracking your work hours and
                        activities.
                      </p>
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          💡 You can check in multiple times per day for breaks
                          and different work sessions.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TimeTrackingDashboard;
