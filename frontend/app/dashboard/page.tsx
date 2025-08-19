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
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { attendanceAPI, AttendanceRecord } from "@/app/api/attendance";
import { logout as logoutAPI } from "@/app/api/auth";

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
  onLogout: () => void;
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
  onLogout,
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
          <Button
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
          </Button>

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is currently in a work session
  const isInWorkSession = Boolean(
    currentAttendance &&
      currentAttendance.check_in_time &&
      !currentAttendance.check_out_time
  );
  const { logout, user } = useAuth();

  // Get employee ID from user (we need to map user ID to employee ID)
  // For now, using a simple mapping since we know test@example.com maps to employee ID 1
  const getEmployeeId = (user: any): number | null => {
    if (!user) return null;

    // Debug: log the user email to see what we're working with
    console.log("User email:", user.email);

    // Simple mapping for now - in production, this should come from the backend
    if (user.email === "test@example.com") return 1;
    if (user.email === "admin@example.com") return 1;
    if (user.email === "farhat@example.com") return 1; // Add your email here
    if (user.email === "ta@2.com") return 1; // Add your actual email here
    if (user.email === "user@example.com") return 1; // Add more emails as needed

    // If email contains certain patterns, map to employee ID 1
    if (
      user.email.includes("test") ||
      user.email.includes("admin") ||
      user.email.includes("farhat") ||
      user.email.includes("ta@2.com")
    ) {
      return 1;
    }

    // Default fallback - but we need to handle this case
    console.log("No employee ID mapping found for email:", user.email);
    return null;
  };

  const employeeId = getEmployeeId(user);

  // Load saved state from localStorage and sync with backend
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

        // Try to get today's attendance from backend
        const todayAttendance =
          await attendanceAPI.getOrCreateTodayAttendance(employeeId);
        setCurrentAttendance(todayAttendance);

        // Check if user is currently in a work session based on backend data
        if (todayAttendance.check_in_time && !todayAttendance.check_out_time) {
          // User is currently checked in and working
          setIsCheckedIn(true);
          setCheckInTime(new Date(todayAttendance.check_in_time));

          // Load activities from localStorage as fallback
          const savedActivities = localStorage.getItem("activities");
          if (savedActivities) {
            try {
              const parsedActivities = JSON.parse(savedActivities).map(
                (activity: any) => ({
                  ...activity,
                  timestamp: new Date(activity.timestamp),
                })
              );
              setActivities(parsedActivities);
            } catch (error) {
              console.error("Error parsing activities:", error);
            }
          }
        } else if (
          todayAttendance.check_in_time &&
          todayAttendance.check_out_time
        ) {
          // User has completed a work session but can start a new one
          setIsCheckedIn(false);
          setCheckInTime(null);

          // Load activities from localStorage as fallback
          const savedActivities = localStorage.getItem("activities");
          if (savedActivities) {
            try {
              const parsedActivities = JSON.parse(savedActivities).map(
                (activity: any) => ({
                  ...activity,
                  timestamp: new Date(activity.timestamp),
                })
              );
              setActivities(parsedActivities);
            } catch (error) {
              console.error("Error parsing activities:", error);
            }
          }
        } else {
          // Load saved state from localStorage as fallback
          const savedCheckIn = localStorage.getItem("isCheckedIn");
          const savedCheckInTime = localStorage.getItem("checkInTime");
          const savedActivities = localStorage.getItem("activities");

          if (savedCheckIn === "true") {
            setIsCheckedIn(true);
          }
          if (savedCheckInTime) {
            setCheckInTime(new Date(savedCheckInTime));
          }
          if (savedActivities) {
            try {
              const parsedActivities = JSON.parse(savedActivities).map(
                (activity: any) => ({
                  ...activity,
                  timestamp: new Date(activity.timestamp),
                })
              );
              setActivities(parsedActivities);
            } catch (error) {
              console.error("Error parsing activities:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading initial state:", error);
        setError(
          "Failed to load attendance data. Using local data as fallback."
        );

        // Fallback to localStorage
        const savedCheckIn = localStorage.getItem("isCheckedIn");
        const savedCheckInTime = localStorage.getItem("checkInTime");
        const savedActivities = localStorage.getItem("activities");

        if (savedCheckIn === "true") {
          setIsCheckedIn(true);
        }
        if (savedCheckInTime) {
          setCheckInTime(new Date(savedCheckInTime));
        }
        if (savedActivities) {
          try {
            const parsedActivities = JSON.parse(savedActivities).map(
              (activity: any) => ({
                ...activity,
                timestamp: new Date(activity.timestamp),
              })
            );
            setActivities(parsedActivities);
          } catch (error) {
            console.error("Error parsing activities:", error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      loadInitialState();
    }
  }, [employeeId]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("isCheckedIn", isCheckedIn.toString());
    if (checkInTime) {
      localStorage.setItem("checkInTime", checkInTime.toISOString());
    }
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [isCheckedIn, checkInTime, activities]);

  // Real-time sync with backend every 30 seconds
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!currentAttendance || !employeeId) return;

      try {
        // Update attendance record with current status
        const updateData: any = {};

        if (isCheckedIn && checkInTime) {
          updateData.check_in_time = checkInTime.toISOString();
        }

        if (!isCheckedIn && currentAttendance.check_in_time) {
          updateData.check_out_time = new Date().toISOString();
        }

        if (Object.keys(updateData).length > 0) {
          const updatedAttendance = await attendanceAPI.updateAttendance(
            currentAttendance.attendance_id,
            updateData
          );
          setCurrentAttendance(updatedAttendance);
        }
      } catch (error) {
        console.error("Error syncing with backend:", error);
        setError("Failed to sync with backend. Changes saved locally.");
      }
    };

    const interval = setInterval(syncWithBackend, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [currentAttendance, employeeId, isCheckedIn, checkInTime]);

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

      // Always ensure we have a current attendance record for today
      if (!currentAttendance) {
        // Try to get or create today's attendance record
        if (!employeeId) {
          setError(
            "Employee profile not found. Please contact your administrator."
          );
          return;
        }

        console.log(
          "No current attendance, getting or creating today's record..."
        );
        const todayAttendance =
          await attendanceAPI.getOrCreateTodayAttendance(employeeId);
        setCurrentAttendance(todayAttendance);

        // Update the local variable for this function
        const updatedAttendance = todayAttendance;

        if (
          updatedAttendance.check_in_time &&
          !updatedAttendance.check_out_time
        ) {
          // User is already checked in, this shouldn't happen
          console.log("User is already checked in, updating local state");
          setIsCheckedIn(true);
          setCheckInTime(new Date(updatedAttendance.check_in_time));
          return;
        }
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
        }
      } else {
        // User is checking in (starting work or resuming from break)
        if (currentAttendance) {
          // If there's already a check-out time, we need a new session
          if (currentAttendance.check_out_time) {
            console.log(
              "Previous session completed, creating new session for today"
            );

            // Try to create a new attendance record for today
            const today = new Date().toISOString().split("T")[0];
            if (!employeeId) {
              setError(
                "Employee profile not found. Please contact your administrator."
              );
              return;
            }

            try {
              // Try to create a new record
              const newAttendance = await attendanceAPI.createAttendance({
                employee: employeeId,
                date: today,
                status: "Checked In",
              });
              setCurrentAttendance(newAttendance);

              // Now check in to the new record
              await attendanceAPI.checkIn(newAttendance.attendance_id);
            } catch (createError: any) {
              // If creation fails due to "already exists", try to get the existing record
              if (
                createError.response?.status === 400 &&
                createError.response?.data?.errors?.non_field_errors?.includes(
                  "already exists"
                )
              ) {
                console.log(
                  "Attendance record already exists, fetching it instead"
                );
                const existingAttendance =
                  await attendanceAPI.getOrCreateTodayAttendance(employeeId);
                setCurrentAttendance(existingAttendance);

                // Try to check in to the existing record
                await attendanceAPI.checkIn(existingAttendance.attendance_id);
              } else {
                // Re-throw other errors
                throw createError;
              }
            }
          } else {
            // Just check in to the existing record
            console.log(
              "Attempting to check in with attendance ID:",
              currentAttendance.attendance_id
            );
            console.log("Current attendance object:", currentAttendance);

            if (!currentAttendance.attendance_id) {
              throw new Error(
                "Attendance ID is missing from current attendance record"
              );
            }

            await attendanceAPI.checkIn(currentAttendance.attendance_id);
          }

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

  const handleLogout = useCallback(async () => {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await logoutAPI(refreshToken);
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    }

    // Reset all state
    setIsCheckedIn(false);
    setIsOnBreak(false);
    setActivities([]);
    setCheckInTime(null);
    workTimer.reset();
    breakTimer.reset();
    // Clear localStorage
    localStorage.removeItem("isCheckedIn");
    localStorage.removeItem("checkInTime");
    localStorage.removeItem("activities");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    // Call the context logout to update auth state
    logout();
  }, [logout, workTimer, breakTimer]);

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
              <Menu size={36} />
            </div>
            <div className="flex items-center gap-4">
              <Image src={"/logo.png"} width={160} height={160} alt="adwello" />
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<LogOut size={16} />}
                onPress={handleLogout}
                className="bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30"
              >
                Logout
              </Button>
            </div>

            {/* Status Indicator */}
            {isInWorkSession && (
              <div className="flex items-center gap-3 pt-8">
                <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">
                  Work Session Active
                </div>
                <div className="text-white text-sm">
                  Currently tracking work hours
                </div>
              </div>
            )}
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
              onLogout={handleLogout}
              disabled={!employeeId}
            />

            {/* Stats Cards - Show if there are activities today */}
            {activities.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Worked Hours"
                  value={`${calculateHoursFromActivities().totalHours.toFixed(1)}h`}
                  subtitle="Today"
                  color="primary"
                />
                <StatsCard
                  title="Expected Hours"
                  value={formatTime(expectedSeconds)}
                  subtitle="Target for today"
                  color="primary"
                />
                <StatsCard
                  title="Break Hours"
                  value={`${calculateHoursFromActivities().breakHours.toFixed(1)}h`}
                  subtitle="Total Breaks"
                  color="primary"
                />
                <StatsCard
                  title="Remaining Hours"
                  value={formatTime(
                    Math.max(
                      0,
                      expectedSeconds -
                        calculateHoursFromActivities().totalHours * 3600
                    )
                  )}
                  subtitle="To reach target"
                  color="primary"
                />
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
                  <Clock size={64} className="mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to Start Your Day?
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Click "Check In" to begin tracking your work hours and
                    activities.
                  </p>
                  {!isInWorkSession && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        💡 You can check in multiple times per day for breaks
                        and different work sessions.
                      </p>
                    </div>
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
